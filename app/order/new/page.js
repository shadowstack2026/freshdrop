"use client";

import BookingForm from "@/components/booking-form";
import { useRouter } from "next/navigation";

export default function NewOrderPage() {
  const router = useRouter();

  function handleBookingSuccess(checkoutUrl) {
    router.push(checkoutUrl);
  }

  return (
    <BookingForm onSubmitSuccess={handleBookingSuccess} />
  );
}
