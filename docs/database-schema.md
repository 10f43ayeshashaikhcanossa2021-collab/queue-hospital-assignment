# Database Schema

## User

- name: string
- email: string
- password: string
- role: ADMIN | RECEPTIONIST | DOCTOR

## Patient

- tokenNumber: string
- name: string
- age: number
- phone: string
- reasonForVisit: string
- status: WAITING | CALLED | IN_CONSULTATION | COMPLETED | NO_SHOW | SKIPPED
- checkInTime: date
- consultationStartTime: date
- consultationEndTime: date
- estimatedWaitTime: number
- actualConsultationDuration: number

## ClinicSettings

- averageConsultationTime: number
- currentToken: string
- lastGeneratedToken: string