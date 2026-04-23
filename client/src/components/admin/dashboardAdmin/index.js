import React, { Fragment, createContext, useReducer } from "react";
import AdminLayout from "../layout";
import { dashboardState, dashboardReducer } from "./DashboardContext";
import TodaySell from "./TodaySell";
import AdminDocuments from "./AdminDocuments";

export { default as AdminDocuments } from "./AdminDocuments";
export const DashboardContext = createContext();

const DashboardComponent = () => {
  return (
    <Fragment>
      <TodaySell />
    </Fragment>
  );
};

const DashboardAdmin = (props) => {
  const [data, dispatch] = useReducer(dashboardReducer, dashboardState);
  return (
    <Fragment>
      <DashboardContext.Provider value={{ data, dispatch }}>
        <AdminLayout children={<DashboardComponent />} />
      </DashboardContext.Provider>
    </Fragment>
  );
};

export default DashboardAdmin;
