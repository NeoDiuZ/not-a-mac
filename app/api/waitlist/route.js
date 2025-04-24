import { NextResponse } from 'next/server';
import dataModel from '../../models/dataModel';

// POST handler for adding to waitlist
export async function POST(request) {
  try {
    const data = await request.json();
    const { email, name, color, address } = data;
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }
    
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    
    if (!color) {
      return NextResponse.json({ error: 'Color selection is required' }, { status: 400 });
    }
    
    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }
    
    const result = await dataModel.addToWaitlist({
      email,
      name,
      color,
      address,
    });
    
    if (!result.success) {
      return NextResponse.json({ 
        error: result.message || 'Failed to add to waitlist',
        details: result.error
      }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, message: 'Added to waitlist successfully' });
  } catch (error) {
    console.error('Waitlist API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 