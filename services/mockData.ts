import { Room, Booking, BookingStatus, Equipment, Loan, LabStaff, AppUser, Notification } from '../types';

// Helper to get local date string YYYY-MM-DD
const getLocalISOString = () => new Date().toLocaleDateString('en-CA'); // en-CA returns YYYY-MM-DD

export const MOCK_ROOMS: Room[] = [];
export const MOCK_BOOKINGS: Booking[] = [];
export const MOCK_EQUIPMENT: Equipment[] = [];
export const MOCK_LOANS: Loan[] = [];
export const MOCK_LAB_STAFF: LabStaff[] = [];
export const MOCK_USERS: AppUser[] = [];
export const MOCK_NOTIFICATIONS: Notification[] = [];