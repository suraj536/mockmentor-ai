import { boolean, integer, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";

export const MockInterview = pgTable('mockInterview', {
    id: serial('id').primaryKey(),
    jsonMockResp: text('jsonMockResp').notNull(),
    jobPosition: varchar('jobPosition').notNull(),
    jobDesc: varchar('jobDesc').notNull(),
    jobExperience: varchar('jobExperience').notNull(),
    createdBy: varchar('createdBy').notNull(),
    createdAt: timestamp('createdAt', { mode: 'string' }),
    mockId: varchar('mockId').notNull()
});

export const Question = pgTable('question', {
    id: serial('id').primaryKey(),
    MockQuestionJsonResp: text('MockQuestionJsonResp').notNull(),
    jobPosition: varchar('jobPosition').notNull(),
    jobDesc: varchar('jobDesc').notNull(),
    jobExperience: varchar('jobExperience').notNull(),
    typeQuestion: varchar('typeQuestion').notNull(),
    company: varchar('company').notNull(),
    createdBy: varchar('createdBy').notNull(),
    createdAt: timestamp('createdAt', { mode: 'string' }),
    mockId: varchar('mockId').notNull()
});



export const UserAnswer = pgTable('userAnswer',{
    id: serial('id').primaryKey(),
    mockIdRef: varchar('mockId').notNull(),
    question: varchar('question').notNull(),
    correctAns: text('correctAns'),
    userAns: text('userAns'),
    feedback: text('feedback'),
    rating: integer('rating'),
    userEmail: varchar('userEmail'),
    createdAt: timestamp('createdAt', { mode: 'string' })
})

export const Newsletter = pgTable('newsletter',{
    id: serial('id').primaryKey(),
    newName: varchar('newName'),
    newEmail: varchar('newEmail'),
    newMessage: text('newMessage'),
    createdAt: timestamp('createdAt', { mode: 'string' })
});

export const SharedReport = pgTable('sharedReport', {
    id: serial('id').primaryKey(),
    tokenHash: varchar('tokenHash', { length: 64 }).notNull().unique(),
    mockId: varchar('mockId', { length: 255 }).notNull(),
    createdBy: varchar('createdBy', { length: 255 }).notNull(),
    includeAnswers: boolean('includeAnswers').default(false).notNull(),
    expiresAt: timestamp('expiresAt', { withTimezone: true, mode: 'string' }),
    createdAt: timestamp('createdAt', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    revokedAt: timestamp('revokedAt', { withTimezone: true, mode: 'string' }),
});
