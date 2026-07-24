import React, { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import AutoScroll from "embla-carousel-auto-scroll";
import companies from "../data/companies.json";

export const CompanyCarousel = () => {
  const [api, setApi] = useState();

  useEffect(() => {
    if (!api) return;

    const handleSelect = () => {
      if (!api.canScrollNext()) {
        setTimeout(() => {
          api.scrollTo(0);
        }, 2000);
      }
    };

    api.on("select", handleSelect);

    return () => {
      api.off("select", handleSelect);
    };
  }, [api]);

  return (
    <Carousel
      setApi={setApi}
      opts={{
        loop: true,
      }}
      plugins={[
        AutoScroll({
          speed: 2,
          stopOnInteraction: false,
          stopOnMouseEnter: false,
          stopOnFocusIn: false,
        }),
      ]}
      className="w-full py-10"
    >
      <CarouselContent className="flex gap-5 sm:gap-20 items-center">
        {companies.map(({ name, id, path }) => (
          <CarouselItem key={id} className="basis-1/3 lg:basis-1/6">
            <img src={path} alt={name} className="h-9 sm:h-14 object-contain" />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
};
