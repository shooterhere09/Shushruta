import React, { Fragment, useEffect, useContext, useState } from "react";
import OrderSuccessMessage from "./OrderSuccessMessage";
import { HomeContext } from "./";
import { sliderImages } from "../../admin/dashboardAdmin/Action";
import { prevSlide, nextSlide } from "./Mixins";

const apiURL = process.env.REACT_APP_API_URL;

const Slider = (props) => {
  const { data, dispatch } = useContext(HomeContext);
  const [slide, setSlide] = useState(0);

  const images = data?.sliderImages || [];

  useEffect(() => {
    sliderImages(dispatch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-advance slides every 4 seconds
  useEffect(() => {
    if (!data?.sliderImages || data.sliderImages.length === 0) return;
    const intervalId = setInterval(() => {
      nextSlide(data.sliderImages.length, slide, setSlide);
    }, 4000);
    return () => clearInterval(intervalId);
  }, [data?.sliderImages, slide]);

  return (
    <Fragment>
      <div className="relative mt-16 bg-gray-100 border-2 h-56 overflow-hidden">
        {data.sliderImages.length > 0 ? (
          <img
            className="w-full h-full object-cover"
            src={`${apiURL}/uploads/customize/${data.sliderImages[slide].slideImage}`}
            alt="sliderImage"
          />
        ) : (
          ""
        )}

        {images.length > 0 && (
          <>
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => prevSlide(images.length, slide, setSlide)}
              style={{ zIndex: 9999 }}
              className={`slider-button absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full bg-black text-white flex items-center justify-center shadow-lg ring-2 ring-white pointer-events-auto`}
            >
              <svg
                className={`w-6 h-6 md:w-8 md:h-8`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              type="button"
              aria-label="Next slide"
              onClick={() => nextSlide(images.length, slide, setSlide)}
              style={{ zIndex: 9999 }}
              className={`slider-button absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full bg-black text-white flex items-center justify-center shadow-lg ring-2 ring-white pointer-events-auto`}
            >
              <svg
                className={`w-6 h-6 md:w-8 md:h-8`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Pagination dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  aria-label={`Go to slide ${idx + 1}`}
                  onClick={() => setSlide(idx)}
                  className={`w-3 h-3 md:w-4 md:h-4 rounded-full mx-1 focus:outline-none ring-1 ring-white ${
                    slide === idx ? "bg-yellow-700" : "bg-black"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      <OrderSuccessMessage />
    </Fragment>
  );
};

export default Slider;
