import React, { Fragment, createContext, useReducer } from "react";
import CategoryMenu from "./CategoryMenu";
import AllCategories from "./AllCategories";
import { categoryState, categoryReducer } from "./CategoryContext";

/* This context manage all of the caregories component's data */
export const CategoryContext = createContext();

const CategoryComponent = () => {
  return (
    <div className="grid grid-cols-1 space-y-4 p-4">
      <CategoryMenu />
      <AllCategories />
    </div>
  );
};

const Categories = () => {
  const [data, dispatch] = useReducer(categoryReducer, categoryState);
  return (
    <Fragment>
      <CategoryContext.Provider value={{ data, dispatch }}>
        <CategoryComponent />
      </CategoryContext.Provider>
    </Fragment>
  );
}

export default Categories;