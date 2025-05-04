import {
  Component,
  computed,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { ShoppingCartLocalStorageService } from '../../services/shopping-cart-local-storage.service';
import {
  faCheckCircle,
  faExclamationCircle,
  faMinus,
  faPlus,
  faTrashCan,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Router, RouterLink } from '@angular/router';
import { PaymentInfoLocalStorageService } from '../../services/payment-info-local-storage.service';
import { PaymentInfoData } from '../../../type';
import { ShoppingCartItemComponent } from '../../components/shopping-cart-item/shopping-cart-item.component';
import { Meta, Title } from '@angular/platform-browser';
import { HeaderComponent } from '../../components/header/header.component';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormArray } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-shopping-cart',
  imports: [
    CommonModule,
    FontAwesomeModule,
    ShoppingCartItemComponent,
    RouterLink,
    HeaderComponent,
    ReactiveFormsModule,
    HttpClientModule
  ],
  template: `
     <app-header />
    <div class="mx-auto flex flex-col-reverse lg:flex-row gap-x-10 min-h-full">
      <!-- Left Section (Order Form) -->
      <div class="w-full lg:w-2/4 py-14 lg:py-0 lg:pb-0 lg:pt-28 px-6 lg:pl-24 lg:pr-8">
  <h2 class="text-xl font-bold uppercase">Order Detail</h2>
  <p>Complete your purchase item by providing your order details</p>
  <form [formGroup]="cartForm" (submit)="simulateCheckoutProcessing($event)">
    <!-- START: Custom Checkout Form -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      
      <!-- Payment & Shipping Method -->
      <div class="space-y-4">
        <label class="form-control w-full">
          <span class="label-text font-semibold">Payment Method</span>
          <input formControlName="paymentMethod" class="input input-bordered w-full" placeholder="e.g., Credit Card" />
        </label>
      </div>

      <div class="space-y-4">
        <label class="form-control w-full">
          <span class="label-text font-semibold">Shipping Method</span>
          <input formControlName="shippingMethod" class="input input-bordered w-full" placeholder="e.g., Standard Shipping" />
        </label>
      </div>

    <!-- Shipping Address -->
      <div class="lg:col-span-2">
        <h3 class="text-md font-bold mb-2">
          Shipping Address <span class="text-red-500">*</span>
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input 
              formControlName="shipping_addressLine1" 
              placeholder="Address Line 1" 
              class="input input-bordered" 
              required
            />
            <div *ngIf="cartForm.controls['shipping_addressLine1'].touched && cartForm.controls['shipping_addressLine1'].invalid" class="text-red-500 text-sm mt-1">
              Address Line 1 is required.
            </div>
          </div>

          <div>
            <input 
              formControlName="shipping_addressLine2" 
              placeholder="Address Line 2" 
              class="input input-bordered"
            />
            <!-- No error message for Address Line 2 -->
          </div>

          <div>
            <input 
              formControlName="shipping_city" 
              placeholder="City" 
              class="input input-bordered" 
              required
            />
            <div *ngIf="cartForm.controls['shipping_city'].touched && cartForm.controls['shipping_city'].invalid" class="text-red-500 text-sm mt-1">
              City is required.
            </div>
          </div>

          <div>
            <input 
              formControlName="shipping_state" 
              placeholder="State" 
              class="input input-bordered" 
              required
            />
            <div *ngIf="cartForm.controls['shipping_state'].touched && cartForm.controls['shipping_state'].invalid" class="text-red-500 text-sm mt-1">
              State is required.
            </div>
          </div>

          <div>
            <input 
              formControlName="shipping_zipCode" 
              placeholder="Zip Code" 
              class="input input-bordered" 
              required
            />
            <div *ngIf="cartForm.controls['shipping_zipCode'].touched && cartForm.controls['shipping_zipCode'].invalid" class="text-red-500 text-sm mt-1">
              Zip Code is required.
            </div>
          </div>

          <div>
            <input 
              formControlName="shipping_country" 
              placeholder="Country" 
              class="input input-bordered" 
              required
            />
            <div *ngIf="cartForm.controls['shipping_country'].touched && cartForm.controls['shipping_country'].invalid" class="text-red-500 text-sm mt-1">
              Country is required.
            </div>
          </div>
        </div>
      </div>


      <!-- Checkbox: Same as Shipping -->
      <div class="flex items-center gap-2 lg:col-span-2 mt-8 lg:mt-0">
        <input type="checkbox" (change)="copyShippingToBilling($event)" class="checkbox" />
        <label class="label-text font-semibold">Billing address same as shipping</label>
      </div>

      <!-- Billing Address -->
      <div class="lg:col-span-2">
        <h3 class="text-md font-bold mb-2">Billing Address</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input formControlName="billing_addressLine1" placeholder="Address Line 1" class="input input-bordered" />
          <input formControlName="billing_addressLine2" placeholder="Address Line 2" class="input input-bordered" />
          <input formControlName="billing_city" placeholder="City" class="input input-bordered" />
          <input formControlName="billing_state" placeholder="State" class="input input-bordered" />
          <input formControlName="billing_zipCode" placeholder="Zip Code" class="input input-bordered" />
          <input formControlName="billing_country" placeholder="Country" class="input input-bordered" />
        </div>
      </div>

      <!-- Notes Section (Full Width) -->
      <div class="space-y-4 lg:col-span-2">
        <label class="form-control w-full">
          <span class="label-text font-semibold">Notes</span>
          <textarea formControlName="notes" class="textarea textarea-bordered w-full" placeholder="Any additional notes or special instructions" rows="1"></textarea>
        </label>
      </div>

    </div>
    <!-- END: Custom Checkout Form -->

    <!-- Conditional Total and Place Order Button -->
    <div *ngIf="cartItemQuantity() >= 1" class="border-t border-t-base-300 pt-4 mt-4 space-y-2">
      <div class="flex items-center justify-between">
        <span>Total Quantity</span>
        <span class="text-lg font-bold">{{ cartItemQuantity() }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span>Total Amount</span>
        <span class="text-lg font-bold">{{ totalPrice() }}</span>
      </div>
    </div>

    <button class="btn btn-primary w-full mt-2" type="submit">
      <ng-container *ngIf="!isLoading() && !isSuccess(); else checkoutSuccess">
        Place Order
      </ng-container>
      <ng-template #checkoutSuccess>
        <ng-container *ngIf="isSuccess()">Checkout success</ng-container>
        <ng-container *ngIf="isLoading()">Processing your payment...</ng-container>
      </ng-template>
    </button>
  </form>
</div>


      <!-- Right Section (Order Summary) -->
      <div class="w-full lg:w-2/4 pb-14 lg:pb-0 lg:py-0 pt-28 lg:pt-28 px-6 lg:pr-24 lg:pl-8">
        <h2 class="text-xl font-bold uppercase">Summary Order</h2>
        <p>
          Check your item and select your shipping for better experience order item
        </p>
        <div>
          <div *ngIf="cartItemQuantity() >= 1" class="mt-4 border border-gray-900 rounded-lg px-4 py-6 space-y-6 max-h-[calc(100dvh-200px)] overflow-y-auto">
            <div *ngFor="let item of cartItems();">
              <div class="border-b border-b-gray-900 pb-5 last:pb-0 last:border-b-0">
                <app-shopping-cart-item [item]="item"></app-shopping-cart-item>
              </div>
            </div>
          </div>
          <div *ngIf="cartItemQuantity() === 0" class="mt-10 flex items-center justify-center flex-col gap-y-2">
            <p class="text-xl text-center text-gray-400">No item in your shopping cart</p>
            <a routerLink="/home" class="btn btn-soft">Continue shopping</a>
          </div>
        </div>
      </div>
    </div>

    <dialog #checkoutSuccessDialog class="modal modal-bottom sm:modal-middle">
      <div class="modal-box">
        <div class="flex items-center justify-center w-full mb-4">
          <fa-icon [icon]="faCheckCircle" class="text-6xl text-emerald-500"></fa-icon>
        </div>
        <h3 class="text-xl font-bold text-center">Thank you for your purchase</h3>
        <div class="modal-action">
          <form method="dialog">
            <button (click)="closeDialog()" class="btn btn-sm">Close</button>
          </form>
        </div>
      </div>
    </dialog>
  `,
})
export class ShoppingCartComponent {
  cartForm: FormGroup;

  constructor(private meta: Meta, private title: Title, private fb: FormBuilder, private http: HttpClient,) {
    this.title.setTitle('Shopping Cart');
    this.meta.updateTag({ name: 'description', content: 'Shopping Cart Page for Angular E-commerce' });
    this.meta.updateTag({ property: 'og:title', content: 'Shopping Cart' });
    this.meta.updateTag({ property: 'og:description', content: 'Shopping Cart Page for Angular E-commerce' });

    this.cartForm = this.fb.group({
      paymentMethod: ['Credit Card'],
      shippingMethod: ['Standard Shipping'],
      shipping_addressLine1: ['', Validators.required],
      shipping_addressLine2: [''],
      shipping_city: ['', Validators.required],
      shipping_state: ['', Validators.required],
      shipping_zipCode: ['', Validators.required],
      shipping_country: ['', Validators.required],
      billing_addressLine1: [''],
      billing_addressLine2: [''],
      billing_city: [''],
      billing_state: [''],
      billing_zipCode: [''],
      billing_country: [''],
      customer_firstName: ['Pareswar'],
      customer_lastName: ['Mallick'],
      customer_email: ['pareswarmallick@gmail.com'],
      customer_phone: ['7894435621'],
      discount_code: ['AUG123'],
      discount_amount: [750],
      tax_rate: [18],
      tax_amount: [200],
      notes: ['']
    });
  }

  faPlus = faPlus;
  faMinus = faMinus;
  faTrashCan = faTrashCan;
  faCheckCircle = faCheckCircle;
  faExclamationCircle = faExclamationCircle;

  private readonly shoppingCartLocalStorageService = inject(ShoppingCartLocalStorageService);
  private readonly paymentInfoLocalStorageService = inject(PaymentInfoLocalStorageService);
  private readonly router = inject(Router);

  rememberPaymentInfo = signal(true);
  isLoading = signal(false);
  isSuccess = signal(false);

  private checkoutSuccessDialog = viewChild<ElementRef<HTMLDialogElement>>('checkoutSuccessDialog');

  cartItems = computed(() => this.shoppingCartLocalStorageService.cartItems());
  cartItemQuantity = computed(() => this.shoppingCartLocalStorageService.cartItemQuantity());
  paymentInfoData = signal(this.paymentInfoLocalStorageService.paymentInfoData());

  totalPrice = computed(() => {
    return new Intl.NumberFormat('en-IN').format(
      this.cartItems().reduce((a, c) => {
        a += c?.price * c?.quantity!;
        return a;
      }, 0)
    );
  });

  simulateCheckoutProcessing(event: Event) {
    this.cartForm.markAllAsTouched();
    event.preventDefault();
    if (this.cartForm.invalid) {
      return;
    }

    const payload = this.preparePayload();
    this.isLoading.set(true);

    this.http.post('http://localhost:2000/shopping-cart-service/v1/order', payload)
      .subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.isSuccess.set(true);

          // Show the success dialog
          const dialogRef = this.checkoutSuccessDialog()?.nativeElement;
          if (dialogRef) {
            dialogRef.showModal();

            // Optional: auto-close dialog and route after a short delay
            setTimeout(() => {
              dialogRef.close();
              this.router.navigate(['/orders']);
            }, 2000);
          } else {
            // If dialog not available, navigate immediately
            this.router.navigate(['/orders']);
          }
        },
        error: (error) => {
          this.isLoading.set(false);
          console.error('Checkout failed', error);
          // Optionally show error notification
        }
      });
  }


  preparePayload(): any {
    const formValues = this.cartForm.value;
    const cartItem = this.cartItems(); // Should return an array of items

    const cartItemPayload = cartItem.map(item => ({
      itemName: item?.title ?? '',  // Fallback to empty string
      quantity: item?.quantity ?? 0,  // Fallback to 0
      unitPrice: item?.price ?? 0,  // Fallback to 0
      totalPrice: (item?.price ?? 0) * (item?.quantity ?? 0),
      sku: ''  // Fallback to empty string
    }));

    const total = parseFloat(this.totalPrice().replace(/[^\d.]/g, ''));
    console.log(total);

    const payload = {
      orderStatus: "Pending",  // Static or you can set it dynamically
      orderTotal: total, // Calculate total price
      paymentMethod: formValues.paymentMethod,
      shippingMethod: formValues.shippingMethod,
      shippingCost: formValues.shippingCost || 200,
      notes: formValues.notes,  // Static, can be made dynamic
      customer: {
        firstName: formValues.customer_firstName,
        lastName: formValues.customer_lastName,
        email: formValues.customer_email,
        phone: formValues.customer_phone
      },
      discount: {
        code: formValues.discount_code,
        amount: formValues.discount_amount
      },
      tax: {
        rate: formValues.tax_rate,
        amount: formValues.tax_amount
      },
      shippingAddress: {
        addressLine1: formValues.shipping_addressLine1,
        addressLine2: formValues.shipping_addressLine2,
        city: formValues.shipping_city,
        state: formValues.shipping_state,
        zipCode: formValues.shipping_zipCode,
        country: formValues.shipping_country
      },
      billingAddress: {
        addressLine1: formValues.billing_addressLine1,
        addressLine2: formValues.billing_addressLine2,
        city: formValues.billing_city,
        state: formValues.billing_state,
        zipCode: formValues.billing_zipCode,
        country: formValues.billing_country
      },
      items: cartItemPayload

    };

    return payload;
  }


  closeDialog() {
    this.checkoutSuccessDialog()?.nativeElement.close();
    this.isLoading.set(false);
    this.isSuccess.set(false);
    if (this.rememberPaymentInfo() && this.paymentInfoData()) {
      this.paymentInfoLocalStorageService.saveData(this.paymentInfoData()!);
    } else {
      this.paymentInfoLocalStorageService.clearItem();
    }
    this.shoppingCartLocalStorageService.clearItems();
    this.paymentInfoData.set(null);
    this.router.navigate(['/home']);
  }

  toggleRememberPaymentInfo(event: Event) {
    const target = event.target as HTMLInputElement;
    this.rememberPaymentInfo.set(target.checked);
  }

  handleInputChange(event: Event, field: keyof PaymentInfoData) {
    const target = event.target as HTMLInputElement;
    this.paymentInfoData.set({
      ...this.paymentInfoData()!,
      [field]: target.value,
    });
  }

  copyShippingToBilling(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.cartForm.patchValue({
        billing_addressLine1: this.cartForm.get('shipping_addressLine1')?.value,
        billing_addressLine2: this.cartForm.get('shipping_addressLine2')?.value,
        billing_city: this.cartForm.get('shipping_city')?.value,
        billing_state: this.cartForm.get('shipping_state')?.value,
        billing_zipCode: this.cartForm.get('shipping_zipCode')?.value,
        billing_country: this.cartForm.get('shipping_country')?.value,
      });
    }
  }
}
