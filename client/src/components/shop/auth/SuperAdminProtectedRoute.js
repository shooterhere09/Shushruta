import React from "react";
import { Route, Redirect } from "react-router-dom";
import { isAuthenticate, isSuperAdmin } from "./fetchApi";
import AdminLayout from "../../admin/layout";

const SuperAdminProtectedRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={(props) =>
      isSuperAdmin() && isAuthenticate() ? (
                <AdminLayout>
          <Component {...props} />
        </AdminLayout>
      ) : (
        <Redirect
          to={{
            pathname: "/",
            state: { from: props.location },
          }}
        />
      )
    }
  />
);

export default SuperAdminProtectedRoute;