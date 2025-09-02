import React from 'react';
import Image from 'next/image';
import Icon from '../ui/Icon';

// Map dot data
const mapDots = [
    { country: "Russian Federation", left: "70%", top: "28%" },
    { country: "Australia", left: "83%", top: "72%" },
    { country: "Angola", left: "50.5%", top: "66%" },
    { country: "Turkey", left: "55%", top: "41.4%" },
    { country: "United States", left: "18%", top: "40.5%" },
    { country: "Greece", left: "52%", top: "41%" },
    { country: "Germany", left: "49%", top: "34.3%" },
    { country: "Qatar", left: "60.2%", top: "48%" },
    { country: "Romania", left: "53%", top: "37.5%" },
    { country: "Belgium", left: "47.2%", top: "34.7%" },
    { country: "United Kingdom", left: "45.5%", top: "33%" },
    { country: "Uzbekistan", left: "63.3%", top: "39.3%" },
    { country: "Macedonia", left: "52.1%", top: "40.2%" },
    { country: "Albania", left: "51.5%", top: "40%" },
    { country: "Netherlands", left: "47.1%", top: "34%" },
    { country: "Ireland", left: "43.8%", top: "33.3%" },
    { country: "Bulgaria", left: "53%", top: "39.4%" },
    { country: "Serbia", left: "51.6%", top: "38.1%" },
    { country: "Poland", left: "51.4%", top: "34.2%" },
    { country: "Italy", left: "49.5%", top: "39.6%" },
    { country: "France", left: "46.5%", top: "37.8%" },
    { country: "Spain", left: "45%", top: "40.8%" },
    { country: "Lithuania", left: "52.4%", top: "32%" },
    { country: "United Arab Emirates", left: "61%", top: "48.9%" },
    { country: "Bosnia and Herzegovina", left: "50.8%", top: "38.3%" },
    { country: "Finland", left: "53.5%", top: "27%" },
    { country: "Hong Kong", left: "77.5%", top: "49%" },
    { country: "Czech Republic", left: "50.3%", top: "35.2%" },
    { country: "Slovenia", left: "50%", top: "37.5%" },
    { country: "Denmark", left: "48.5%", top: "32%" },
    { country: "Switzerland", left: "48.2%", top: "36.8%" },
    { country: "Hungary", left: "51.2%", top: "37.6%" },
    { country: "Singapore", left: "74.3%", top: "58.7%" },
    { country: "Portugal", left: "43.5%", top: "40.8%" },
    { country: "Sweden", left: "50.5%", top: "27%" },
    { country: "Estonia", left: "53%", top: "29.8%" },
    { country: "Republic of Kosova", left: "51.4%", top: "38.4%" },
    { country: "Austria", left: "50.1%", top: "36.1%" },
    { country: "Slovakia", left: "51.4%", top: "35.6%" },
    { country: "Moldova", left: "53.8%", top: "37%" },
    { country: "Croatia", left: "50.3%", top: "38.5%" },
    { country: "Ukraine", left: "54.4%", top: "35%" },
    { country: "Georgia", left: "58%", top: "39.9%" },
    { country: "Saudi Arabia", left: "58.5%", top: "49%" },
    { country: "India", left: "68%", top: "49%" },
    { country: "Israel", left: "55.5%", top: "45.1%" },
    { country: "Gibraltar", left: "44.4%", top: "42.4%" },
    { country: "Jordan", left: "56.1%", top: "45.3%" },
    { country: "Iraq", left: "57.5%", top: "44.5%" },
    { country: "Azerbaijan", left: "59.5%", top: "40.4%" },
    { country: "Japan", left: "84.6%", top: "42.8%" },
    { country: "Kenya", left: "56.5%", top: "57%" },
    { country: "Malta", left: "50%", top: "43%" },
    { country: "Morocco", left: "44%", top: "45%" },
    { country: "Norway", left: "48.5%", top: "29%" },
    { country: "Ghana", left: "45.7%", top: "56%" },
    { country: "Latvia", left: "53%", top: "30.7%" },
    { country: "Yemen", left: "59%", top: "53%" },
    { country: "Lebanon", left: "55.7%", top: "44.5%" },
    { country: "Kazakhstan", left: "64%", top: "35.5%" },
    { country: "Kuwait", left: "59.1%", top: "46%" },
    { country: "South Africa", left: "52.5%", top: "74%" },
    { country: "China", left: "72.5%", top: "43%" },
    { country: "Bahrain", left: "59.9%", top: "47.7%" },
    { country: "Canada", left: "16%", top: "30%" },
    { country: "Tunisia", left: "48.8%", top: "44.6%" }
];

// Map dot component
const MapDot = ({ country, left, top }: { country: string; left: string; top: string }) => (
    <div 
        className="dot dot-item group/dot pointer-events-auto absolute min-lg:opacity-0 duration-350 min-lg:delay-350 [&.is-active]:opacity-100 hover:z-5 [&.is-active]:delay-450 is-active" 
        style={{ left, top }}
    >
        <div className="text-selector absolute left-[100%] top-0 w-max p-7 flex flex-col items-center justify-center duration-450 translate-y-[10px] opacity-0 group-hover/dot:!opacity-100 group-hover/dot:translate-y-0 before:absolute before:left-0 before:bottom-[-10px] before:bg-transparent before:w-full before:h-[20px] bg-primary rounded-4 border border-solid border-white/24 pointer-events-none shadow-[0px_0px_60px_0px_rgba(246,_148,_30,_0.10);] sm:left-[50%] sm:translate-x-[-50%] sm:top-[100%]">
            <div className="text-content flex justify-center items-center relative z-20">
                <p className="text text-[12px] sm:text-[10px] font-normal leading-[14px] text-white text-center line-clamp-4 uppercase">
                    {country}
                </p>
            </div>
        </div>
        <div className="content w-[30px] h-[30px] lg:w-[25px] lg:h-[25px] md:w-[20px] md:h-[20px] relative flex items-center justify-center duration-450 group-hover/dot scale-105:">
            <div className="dot-item rounded-full absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 duration-350">
                <Icon 
                name="icon-location"
                style={{color: "rgb(246, 149, 30)"}} 
                className="ho-[14px] text-[14px] md:text-12 md:h-12 text-primary duration-450 relative z-20 flex sm:!text-primary justify-center items-center group-hover:text-white" 
                size={14}
                />
            </div>
        </div>
    </div>
);

export default function MapSection() {
    return (
        <section className="world-map-section py-[100px] 2xl:py-[80px] xl:py-[60px] lg:py-[45px] md:py-[30px] relative lg:h-full bg-white overflow-hidden isolate">
            <div className="container max-w-[1680px] lg:my-auto">
                <div className="title sm:text-center mb-50 md:mb-30">
                    <div className="text-editor max-w-full editor-strong:font-bold editor-strong:text-primary editor-h2:leading-relaxed editor-h4:text-gray editor-h5:text-gray text-center">
                        <h2>WE SERVE ALL OVER THE <strong>WORLD</strong></h2>
                        <h5>
                            Through its innovative approach and customer-focused service,<br />
                            Seen Group continues its sustainable growth in the global market.
                        </h5>
                    </div>
                </div>
                <div className="wrapper relative">
                    <div className="map-field relative">
                        <div className="image aspect-[1920/1200] max-h-[150vh] max-w-[1680px] w-full overflow-hidden translate-z-0 relative z-20 mx-auto">
                            <Image 
                                src="/imgs/map.png" 
                                className="w-full h-full object-contain object-center" 
                                alt="Seen Group | HOME" 
                                width={1680}
                                height={1200}
                                priority={false}
                            />
                        </div>

                        {/* Interactive Map Dots */}
                        <div className="dot-field absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] aspect-[1920/1200] max-h-[150vh] w-full h-full pointer-events-none z-20">
                            {mapDots.map((dot, index) => (
                                <MapDot 
                                    key={index}
                                    country={dot.country}
                                    left={dot.left}
                                    top={dot.top}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
