import React, { Fragment, createContext, useReducer } from "react";
import DashboardCard from "./DashboardCard";
import Customize from "./Customize";
import { dashboardState, dashboardReducer } from "./DashboardContext";
import TodaySell from "./TodaySell";

export const DashboardContext = createContext();

const SuperAdminDashboardComponent = () => {
  return (
    <Fragment>
      <DashboardCard />
      <Customize />
      <TodaySell />
    </Fragment>
  );
};

const SuperAdminDashboard = (props) => {
  const [data, dispatch] = useReducer(dashboardReducer, dashboardState);
  return (
    <Fragment>
      <DashboardContext.Provider value={{ data, dispatch }}>
        <SuperAdminDashboardComponent />
      </DashboardContext.Provider>
    </Fragment>
  );
};

export default SuperAdminDashboard;