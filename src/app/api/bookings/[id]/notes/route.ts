import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid booking ID' }, { status: 400 });
    }

    const { notes } = await request.json();

    // Get the booking first to get the email
    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Update the booking with notes
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { notes },
    });

    // Send email notification if we have an API key
    if (process.env.RESEND_API_KEY && notes) {
      try {
        const bookingDate = new Date(booking.dateTime).toLocaleString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        });

        await resend.emails.send({
          from: process.env.FROM_EMAIL || 'Mattox J Fitness <onboarding@resend.dev>',
          to: booking.email,
          subject: 'Update on Your Training Consultation',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Hi ${booking.clientName},</h2>
              <p>You have a new note regarding your consultation scheduled for:</p>
              <p style="background: #f5f5f5; padding: 15px; border-radius: 8px;">
                <strong>${bookingDate}</strong>
              </p>
              <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #333;"><strong>Note from Mattox J:</strong></p>
                <p style="margin: 10px 0 0 0; color: #555;">${notes}</p>
              </div>
              <p>If you have any questions, feel free to reply to this email.</p>
              <p style="color: #888; font-size: 14px; margin-top: 30px;">
                - Mattox J Personal Training
              </p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error('Error updating notes:', error);
    return NextResponse.json({ error: 'Failed to update notes' }, { status: 500 });
  }
}
