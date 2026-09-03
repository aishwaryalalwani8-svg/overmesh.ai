import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const amount = Number(body.amount);

    if (!amount || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Valid payment amount is required.",
        },
        { status: 400 }
      );
    }

    // Razorpay expects amount in paise.
    const amountInPaise = Math.round(amount * 100);

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `overmesh-${Date.now()}`,
      notes: {
        platform: "OverMesh AI",
        orderReference: body.orderReference || "demo-order",
      },
    });

    return NextResponse.json({
      success: true,

      keyId: process.env.RAZORPAY_KEY_ID,

      razorpayOrder: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        status: razorpayOrder.status,
      },
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Could not create Razorpay order.",
      },
      { status: 500 }
    );
  }
}