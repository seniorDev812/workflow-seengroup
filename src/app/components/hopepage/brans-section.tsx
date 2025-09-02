"use client";

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import Icon from '../ui/Icon';

type Brand = {
    name: string;
    description: string;
    image: string;
    link: string;
};

// Swiper type for better type safety
type SwiperInstance = any; // eslint-disable-line @typescript-eslint/no-explicit-any


const brands: Brand[] = [
    {
        name: "ABERTO DESIGN",
        description:
            "Aberto Design is a wall decor brand owned by Seen Group, aiming to add an aesthetic touch to your spaces with its unique designs.",
        image: "/imgs/Aberto-Design-Logo3-e1730469228657.jpg",
        link: "https://www.abertodesign.com/",
    },
    {
        name: "AQUA CHIC",
        description:
            "Aqua Chic, the modern and stylish watch brand of Seen Group, adds a touch of elegance to every moment with its refined designs and functionality.",
        image: "/imgs/0014_Aqua-Chic-Logo-2.jpg",
        link: "https://www.aquachic1987.com/",
    },
    {
        name: "ATELIER DEL SOFA",
        description:
            "Atelier Del Sofa is a furniture brand owned by Seen Group, aiming to add elegance to your living spaces by prioritizing comfort with its sophisticated designs.",
        image: "/imgs/Atelier-Del-Sofa-Logo-Black.jpg",
        link: "https://www.atelierdelsofa.com/",
    },
    {
        name: "BHAROON",
        description:
            "Bharoon, a furniture brand that stands out with its aesthetic design and quality production approach. Our mission is to offer original and functional furniture designs to make your homes more livable and beautiful.",
        image: "/imgs/Bharoon-Logo-05.jpg",
        link: "https://www.bharoon.com/",
    },
    {
        name: "CHEZ ADELARD",
        description:
            "Chez Adelard is a pioneering brand in the world of furniture, combining elegance and functionality. Each piece we design with years of experience and passion offers aesthetics and comfort while personalizing your home.",
        image: "/imgs/Chez-Adelard-logo.jpg",
        link: "https://www.chezadelard.com/",
    },
    {
        name: "CHEZ LORRAINE",
        description:
            "Chez Lorraine is one of Seen Groupâ€™s leading decoration brand, which reflects quality and classiness with its highly different product range.",
        image: "/imgs/chez-lorraine-logo.jpg",
        link: "https://www.chezlorraine.com/",
    },
    {
        name: "CHEZ ROSALIE",
        description:
            "Chez Rosalie, Seen Group's elegant women's fashion brand, combines sophistication and comfort to offer personalized solutions for every woman's style.",
        image: "/imgs/0013_Chez-Rosalie-Logo-v1.jpg",
        link: "https://www.chezrosalie.com/",
    },
    {
        name: "CHEZALOU",
        description:
            "Chezalou is one of the Turkeyâ€™s premier apparel producer owned by Seen Group; established in 2011.",
        image: "/imgs/Chezalou-Logo.jpg",
        link: "https://www.chezalou.com/",
    },
    {
        name: "COIN DE PIERRE",
        description:
            "At Coin De Pierre, we perceive your home not just as a living space but also as a place filled with emotions and stories. As a part of Seen Group, we share our extensive experience and passion for home decoration with you.",
        image: "/imgs/0012_Coin-De-Pierre-Logo.jpg",
        link: "https://www.coindepierre.com/",
    },
    {
        name: "CONCEPTUM HYPNOSE",
        description:
            "Conceptum Hypnose is one of the leading rug & carpet design and manufacturing brand that belongs to Seen Group.",
        image: "/imgs/Conceptum-Hypnose-Logo.jpg",
        link: "https://www.conceptumhypnose.com/",
    },
    {
        name: "DAISY CHILDREN",
        description:
            "Daisy Children, Seen Group's joyful children's clothing brand, offers little ones a perfect blend of style, comfort, and playful designs.",
        image: "/imgs/0011_Daisy-Logo.jpg",
        link: "https://www.daisychildren.com/",
    },
    {
        name: "DECO DESIGN",
        description:
            "Deco Design, Seen Group's stylish and functional furniture brand, brings a modern touch and elegant living spaces to your home.",
        image: "/imgs/0010_Deco-Design-Yeni-1.jpg",
        link: "https://www.decodesignconcept.com/",
    },
    {
        name: "DEFILE PARIS",
        description:
            "DÃ©filÃ© Paris was founded with the aim of providing fashion-conscious customers with access to the latest trends in clothing and accessories.",
        image: "/imgs/defile-paris-logo.jpg",
        link: "https://www.defileparis.com/",
    },
    {
        name: "ELIZABED",
        description:
            "Elizabed, Seen Group's elegant home textile brand, transforms your living spaces with high-quality products that combine comfort and style.",
        image: "/imgs/0009_Elizabed-Logo.jpg",
        link: "https://www.elizabed.com/",
    },
    {
        name: "ELYSIAN CARPET",
        description:
            "Elysian Carpet, the prestigious brand of Seen Group, adds elegance and comfort to your home with its sophisticated designs and superior craftsmanship.",
        image: "/imgs/0008_Elysian-Carpet-Logo.jpg",
        link: "https://www.elysiancarpet.com/",
    },
    {
        name: "EVILA ORIGINALS",
        description:
            "Evila Originals is the unique and pioneering decoration brand of Seen Group. With our rich experience in the field of decoration and furniture, we bring high-quality, stylish, and original designs to our valued customers.",
        image: "/imgs/Evila-Originals-Yeni-Logo-02.jpg",
        link: "https://www.evilaoriginals.com/",
    },
];



function BrandCard({ brand }: { brand: Brand }) {
    return (
        <div
        className="swiper-slide group/slide flex justify-center items-center [&_.brands-box]:border-0 [&_.brands-box]:!border-[#DDDDDD] [&.swiper-slide-active_.brands-box]:border-l [&.swiper-slide-active_.brands-box]:border-solid [&.swiper-slide-active_.brands-box]:border-[#DDDDDD] [&_.brands-box]:border-t [&_.brands-box]:border-r [&_.brands-box]:border-solid [&_.brands-box]:text-[#DDDDDD] [&_.brands-box]:border-b overflow-visible hover:z-20"
    >
        <div className="brands-box relative w-full h-full group/brands shadow-transparent hover:shadow-[0px_0px_60px_0px_rgba(0,_0,_0,_0.10);] duration-350">
            <div className="image-field bg-transparent py-50 group-hover/brands:pb-20 sm:py-30 sm:group-hover/brands:pb-30 xsm:bg-white w-full h-auto duration-350 flex flex-col justify-center items-center overflow-hidden isolate border-solid border-transparent">
                <div className="img h-[200px] lg:h-150 sm:h-120 w-full overflow-hidden isolate relative">
                    <Image
                        className="h-full w-full object-contain opacity-100 duration-350"
                        src={brand.image}
                        alt={`${brand.name} - Seen Group Brand`}
                        width={300}
                        height={200}
                        priority={false}
                    />
                </div>
            </div>

            <div className="brands-content group/box flex flex-col h-auto justify-center gap-[15px] p-50 pt-30 2xl:p-40 xl:p-30 sm:p-20 md:gap-[10px] md:items-center group-hover/brands:pt-0 sm:pt-0 duration-350">
                <div
                    className="blog-title text-[24px] lg:text-[22px] md:text-[20px] sm:text-[18px] xsm:text-16 text-black font-medium leading-[36px] sm:leading-snug line-clamp-2 md:text-center"
                    lang="en-US"
                >
                    {brand.name}
                </div>

                <div className="expo text-[14px] sm:text-12 hyphens-auto text-gray font-normal leading-[24px] sm:leading-snug line-clamp-2 md:text-center">
                      {brand.description}
                </div>

                <div className="button-field md:w-full flex flex-wrap sm:justify-center gap-50 sm:gap-[25px] max-w-[500px] md:max-w-full duration-350 h-0 group-hover/brands:h-45 translate-y-20 group-hover/brands:translate-y-0 mt-10 group-hover/brands:mt-30 sm:!mt-10 xsm:group-hover/brands:mt-15 overflow-hidden isolate sm:translate-y-0 sm:!h-50 absolute left-0 bottom-40 xl:bottom-25 px-50 xl:px-30 sm:relative sm:bottom-0">
                    <a
                        href={brand.link}
                        className="group/button w-auto h-auto max-h-[45px] m-auto py-10 px-25 lg:px-15 bg-primary border border-solid border-white/15 text-white relative flex flex-row justify-center items-center font-bold rounded-[8px] duration-450 overflow-hidden isolate shadow-[0_0_20px_-10px] shadow-transparent hover:shadow-white"
                    >
                        <div className="text-content flex gap-10 items-center">
                            <div className="text text-white text-[16px] sm:text-14 font-normal leading-[41px] lg:leading-8 md:leading-6 duration-450 group-hover/menu-item:!text-white relative z-2">
                                Go To Web Site
                            </div>
                            <div className="icon relative flex justify-center items-center z-2">
                                <Icon 
                                    name="icon-arrow-right" 
                                    className="h-[14px] text-[14px] md:text-12 md:h-12 sm:w-10 sm:h-10 text-white duration-450 relative z-20 flex sm:!text-white justify-center items-center group-hover:text-white group-hover:rotate-45 group-hover/button:translate-x-5" 
                                    size={14}
                                />
                            </div>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    </div>
    );
}
export default function BrandsSection() {
    const swiperRef = useRef<HTMLDivElement>(null);
    const swiperInstanceRef = useRef<SwiperInstance>(null);

    useEffect(() => {

        const initSwiper = async () => {
            try {
                const { Swiper } = await import('swiper');
                const { Navigation, Pagination, Autoplay } = await import('swiper/modules');
           
                if (swiperRef.current && !swiperInstanceRef.current) {
                    swiperInstanceRef.current = new Swiper(swiperRef.current, {
                        modules: [Navigation, Pagination, Autoplay],
                        slidesPerView: 'auto',
                        spaceBetween: 0,
                        centeredSlides: false,
                        loop: true,
                        width: null,
                        autoplay: {
                            delay: 5000,
                            disableOnInteraction: false,
                            pauseOnMouseEnter: true,
                        },
                        navigation: {
                            nextEl: '.areas-icon-next',
                            prevEl: '.areas-icon-prev',
                            disabledClass: 'swiper-button-disabled',
                        },
                        pagination: {
                            el: '.ares-icon-pagination',
                            clickable: true,
                            bulletClass: 'swiper-pagination-bullet',
                            bulletActiveClass: 'swiper-pagination-bullet-active',
                            renderBullet: function (index: number, className: string) {
                                return `<div class="${className} w-[8px] h-[8px] rounded-full bg-black/20 transition-all duration-300 ease-in-out [&.swiper-pagination-bullet-active]:bg-primary [&.swiper-pagination-bullet-active]:w-[24px]"></div>`;
                            }
                        },
                        breakpoints: {
                            320: {
                                slidesPerView: 1,
                                spaceBetween: 0,
                                width: 260 * 1,
                            },
                            768: {
                                slidesPerView: 2,
                                spaceBetween: 0,

                            },
                            1024: {
                                slidesPerView: 3,
                                spaceBetween: 0,
                                width: 330 * 3,
                            },
                            1440: {
                                slidesPerView: 4,
                                spaceBetween: 0,
                                width: 330 * 4,

                            },
                            1500: {
                                slidesPerView: 4,
                                spaceBetween: 0,
                                slidesPerGroup: 1,
                                width: 400 * 4,
                            }
                        },
                        speed: 600,
                        grabCursor: true,
                        allowTouchMove: true,
                        on: {
                            init: function () {
                      
                            },
                            slideChange: function () {
                                // Handle slide change events if needed
                            },
                            beforeDestroy: function () {
                            }
                        }
                    });
                }
            } catch (error) {
                console.error('Failed to initialize Brands Swiper:', error);
            }
        };

        // Initialize after a small delay to ensure DOM is ready
        const timer = setTimeout(() => {
            initSwiper();
        }, 100);

        // Add resize listener to update swiper on window resize
        const handleResize = () => {
            if (swiperInstanceRef.current) {
                swiperInstanceRef.current.update();
            }
        };

        window.addEventListener('resize', handleResize);

        // Cleanup function
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', handleResize);
            if (swiperInstanceRef.current) {
                swiperInstanceRef.current.destroy(true, true);
                swiperInstanceRef.current = null;
            }
        };
    }, []);

    return (
        <section
            className="brands-field relative overflow-hidden isolate pt-[150px] 2xl:pt-[80px] xl:pt-[60px] lg:pt-[45px] md:pt-[30px] bg-white"
        >
            <div className="image absolute top-0 left-0 w-full h-full overflow-hidden isolate mx-auto z-0 pointer-events-none">
                <Image
                    src="/imgs/brands-bg.png"
                    className="w-full h-full object-cover object-center"
                    alt="Seen Group | HOME"
                    fill
                    priority={false}
                />
            </div>
            <div className="container max-w-[1800px]">
                <div className="wrapper grid grid-cols-1 srb-short-all">
                    <div className="title-field relative flex flex-col justify-center gap-30 max-w-[1220px] mx-auto px-200 mb-30 md:px-150 sm:px-0 sm:mb-0"
                        data-sr-id="18"
                        style={{ visibility: "visible", opacity: 1, transform: "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)", transition: "all, opacity 1s cubic-bezier(0.5, 0, 0, 1), transform 1s cubic-bezier(0.5, 0, 0, 1)" }}>
                        <div
                            className="text-editor max-w-full editor-strong:font-bold editor-strong:italic editor-h2:leading-relaxed editor-h4:text-gray editor-h5:text-gray text-center gap-20">
                            <h1>BRANDS</h1>
                            <h5>Seen Group serves a wide customer portfolio worldwide.< br />
                                With high-quality products and a reliable service approach,<br />
                                Seen Group has established a strong presence in the global market.</h5>
                        </div>
                        <div
                            className="controller z-2 w-full absolute left-0 top-[50%] translate-y-[-50%] sm:relative sm:translate-y-0 sm:top-[unset] sm:left-[unset]">
                            <div
                                className="carousel-navigation flex gap-15 items-center justify-between pointer-events-none mb-0 sm:justify-center">
                                <div
                                    className="areas-icon-prev pointer-events-auto [&.swiper-button-disabled]:pointer-events-none duration-450 ease-samedown slides-nav__item group">
                                    <div
                                        className="icon group/item flex items-center justify-center rounded-full cursor-pointer duration-500 ease-samedown ml-auto border border-solid border-black/35 p-19 sm:p-15 group-hover:border-primary group-[&.swiper-button-disabled]:border-black/20">
                                        <div className="icon-arrow w-full h-full">
                                            <Icon
                                                name="icon-arrow-left"
                                                className="text-20 h-20 sm:text-16 sm:h-16 text-black/35 group-hover:-translate-x-3 group-hover:text-primary group-[&.swiper-button-disabled]:text-black/35 duration-500 relative z-20 flex justify-center items-center"
                                                size={20}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div
                                    className="areas-icon-next pointer-events-auto [&.swiper-button-disabled]:pointer-events-none duration-450 ease-samedown slides-nav__item group">
                                    <div
                                        className="icon group/item flex items-center justify-center rounded-full cursor-pointer duration-500 ease-samedown ml-auto border border-solid border-black/35 p-19 sm:p-15 group-hover:border-primary group-[&.swiper-button-disabled]:border-black/20">
                                        <div className="icon-arrow w-full h-full">
                                            <Icon
                                                name="icon-arrow-right"
                                                className="text-20 h-20 sm:text-16 sm:h-16 text-black/35 group-hover:translate-x-3 group-hover:text-primary group-[&.swiper-button-disabled]:text-black/35 duration-500 relative z-20 flex justify-center items-center"
                                                size={20}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div 
                        ref={swiperRef}
                        className="swiper areas-icon-slider w-full p-50 sm:p-0 sm:my-30 animate-carousel swiper-initialized swiper-horizontal"
                        data-sr-id="19"
                        style={{
                            visibility: "visible",
                            opacity: 1,
                            transform:
                                "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)",
                            transition:
                                "all, opacity 1s cubic-bezier(0.5, 0, 0, 1), transform 1s cubic-bezier(0.5, 0, 0, 1)",
                        }}
                    >
                        <div className="swiper-wrapper">
                            {brands.map((brand) => (
                                <BrandCard key={brand.name} brand={brand} />
                            ))}
                        </div>
                    </div>
                </div>
                <div className="banner-content flex justify-center items-center w-full p pb-30 px-22 xsm:flex-col xsm:gap-15 sm:justify-center"
                    data-sr-id="20"
                    style={{
                        visibility: "visible",
                        opacity: 1,
                        transform: "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)",
                        transition:
                            "all, opacity 1s cubic-bezier(0.5, 0, 0, 1), transform 1s cubic-bezier(0.5, 0, 0, 1)",
                    }}
                >
                    <div className="ares-icon-pagination relative flex flex-row gap-8 items-center justify-start sm:justify-start !translate-x-0 !left-0 mt-15 pt-5 sm:pl-50 swiper-pagination-clickable swiper-pagination-bullets swiper-pagination-horizontal swiper-pagination-bullets-dynamic"
                        style={{ width: "240px" }}
                    ></div>
                </div>
            </div>
        </section>
    )
}
