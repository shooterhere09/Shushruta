import React from "react";
import {
  Home,
  WishList,
  ProtectedRoute,
  AdminProtectedRoute,
  SuperAdminProtectedRoute,
  CartProtectedRoute,
  PageNotFound,
  ProductDetails,
  ProductByCategory,
  CheckoutPage,
} from "./shop";
import { DashboardAdmin, Products, Orders, HospitalDetails, EditProfile, AdminDocuments } from "./admin";
import SuperAdminPage from "./superadmin/superAdminDashboard";
import SuperAdminCategories from "./superadmin/categories";
import SuperAdminRequests from "./superadmin/requests";
import { UserProfile, UserOrders, SettingUser, PhoneVerify, Documents } from "./shop/dashboardUser";
import ResetPassword from "./shop/auth/ResetPassword";

import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

/* Routing All page will be here */
const Routes = (props) => {
  return (
    <Router>
      <Switch>
        {/* Shop & Public Routes */}
        <Route exact path="/" component={Home} />
        <Route exact path="/wish-list" component={WishList} />
        <Route exact path="/products/:id" component={ProductDetails} />
        <Route
          exact
          path="/products/category/:catId"
          component={ProductByCategory}
        />
        <CartProtectedRoute
          exact={true}
          path="/checkout"
          component={CheckoutPage}
        />
        <Route exact path="/reset-password/:resetToken" component={ResetPassword} />
        {/* Shop & Public Routes End */}

        {/* Admin Routes */}
        <AdminProtectedRoute
          exact={true}
          path="/admin/dashboard"
          component={DashboardAdmin}
        />
        
        <AdminProtectedRoute
          exact={true}
          path="/admin/dashboard/products"
          component={Products}
        />
        <AdminProtectedRoute
          exact={true}
          path="/admin/dashboard/orders"
          component={Orders}
        />
        <AdminProtectedRoute
          exact={true}
          path="/admin/dashboard/hospital-details"
          component={HospitalDetails}
        />
        <AdminProtectedRoute
          exact={true}
          path="/admin/dashboard/edit-profile"
          component={EditProfile}
        />
        <AdminProtectedRoute
          exact={true}
          path="/admin/dashboard/documents"
          component={AdminDocuments}
        />
        {/* Admin Routes End */}

        {/* SuperAdmin Route */}
        <SuperAdminProtectedRoute
          exact={true}
          path="/superadmin/dashboard"
          component={SuperAdminPage}
        />
        <SuperAdminProtectedRoute
          exact={true}
          path="/superadmin/dashboard/categories"
          component={SuperAdminCategories}
        />
        <SuperAdminProtectedRoute
          exact={true}
          path="/superadmin/dashboard/requests"
          component={SuperAdminRequests}
        />
        <SuperAdminProtectedRoute
          exact={true}
          path="/superadmin/dashboard/orders"
          component={Orders}
        />

        {/* User Dashboard */}
        <ProtectedRoute
          exact={true}
          path="/user/profile"
          component={UserProfile}
        />
        <ProtectedRoute
          exact={true}
          path="/user/verify-phone"
          component={PhoneVerify}
        />
        <ProtectedRoute
          exact={true}
          path="/user/orders"
          component={UserOrders}
        />
        <ProtectedRoute
          exact={true}
          path="/user/setting"
          component={SettingUser}
        />
        <ProtectedRoute
          exact={true}
          path="/user/documents"
          component={Documents}
        />
        {/* User Dashboard End */}

        {/* 404 Page */}
        <Route component={PageNotFound} />
      </Switch>
    </Router>
  );
};

export default Routes;
