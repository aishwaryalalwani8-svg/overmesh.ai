import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabase } from "../../../../lib/supabase";
export async function POST(request: Request) {
  try {
    const body = await request.json();

   const {
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
  databaseOrderId,
} = body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing payment verification data.",
        },
        { status: 400 }
      );
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      throw new Error("Razorpay secret is not configured.");
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");

    const isValid =
      expectedSignature === razorpay_signature;

    if (!isValid) {
        if (databaseOrderId) {
  const { error: databaseError } = await supabase
    .from("orders")
    .update({
      payment_status: "paid",
      razorpay_payment_id,
      razorpay_order_id,
      paid_at: new Date().toISOString(),
    })
    .eq("id", databaseOrderId);

  if (databaseError) {
    console.error(
      "Payment database update error:",
      databaseError
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Payment verified, but order payment status could not be saved.",
      },
      { status: 500 }
    );
  }
}
      return NextResponse.json(
        {
          success: false,
          error: "Invalid payment signature.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      paymentId: razorpay_payment_id,
      message: "Payment verified successfully.",
    });
  } catch (error) {
    console.error(
      "Razorpay verification error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Payment verification failed.",
      },
      { status: 500 }
    );
  }
}