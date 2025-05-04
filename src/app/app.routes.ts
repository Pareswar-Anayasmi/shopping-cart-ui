import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { JewelryComponent } from './pages/jewelry/jewelry.component';
import { ElectronicsComponent } from './pages/electronics/electronics.component';
import { ShoppingCartComponent } from './pages/shopping-cart/shopping-cart.component';
import { MenClothingComponent } from './pages/men-clothing/men-clothing.component';
import { WomenClothingComponent } from './pages/women-clothing/women-clothing.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { FavoriteItemsComponent } from './pages/favorite-items/favorite-items.component';
import { LoginComponent } from './components/login/login.component';
import { OrderDetailsComponent } from './pages/order-details/order-details.component';

export const routes: Routes = [
  { path: '', title: 'Shopzo - Login', component: LoginComponent },
  { path: 'home', title: 'Shopzo - Home', component: HomeComponent },
  {
    path: 'favorite-items',
    title: 'Favorite Items',
    component: FavoriteItemsComponent,
  },
  {
    path: 'products/:id',
    title: 'Product Details',
    component: ProductDetailComponent,
  },
  {
    path: 'men-clothing',
    title: `Men's Clothings`,
    component: MenClothingComponent,
  },
  {
    path: 'women-clothing',
    title: `Women's Clothings`,
    component: WomenClothingComponent,
  },
  { path: 'jewelry', title: 'Jewelry', component: JewelryComponent },
  {
    path: 'electronics',
    title: 'Electronics',
    component: ElectronicsComponent,
  },
  {
    path: 'shopping-cart',
    title: 'Shopping Cart',
    component: ShoppingCartComponent,
  },
  {
    path: 'orders',
    title: 'Shopzo - Orders',
    component: OrderDetailsComponent,
  },
];
