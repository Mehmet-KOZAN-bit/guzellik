import Hero from "@/components/Hero";
import ServicesOverview from "@/components/ServicesOverview";
import WhyUs from "@/components/WhyUs";
import Stats from "@/components/Stats";
import Testimonials from "@/components/Testimonials";
import BookingCTA from "@/components/BookingCTA";

export default function Home() {
  return (
    <>
      <Hero />
      <Stats />
      <ServicesOverview />
      <WhyUs />
      <Testimonials />
      <BookingCTA />
    </>
  );
}
