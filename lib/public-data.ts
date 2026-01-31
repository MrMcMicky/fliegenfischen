import { prisma } from "@/lib/db";
import type {
  Course,
  CourseSession,
  LessonOffering,
  Report,
  SiteSettings,
  VoucherOption,
} from "@prisma/client";

export const getSiteSettings = async (): Promise<SiteSettings> => {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  if (!settings) {
    throw new Error("Site settings missing");
  }
  return settings;
};

export const getCourses = async (): Promise<Course[]> =>
  prisma.course.findMany({ orderBy: { title: "asc" } });

export const getCourseBySlug = async (slug: string) =>
  prisma.course.findUnique({ where: { slug } });

export const getCourseSessions = async (): Promise<CourseSession[]> =>
  prisma.courseSession.findMany({ orderBy: { date: "asc" } });

export const getSessionsForCourse = async (courseId: string) =>
  prisma.courseSession.findMany({
    where: { courseId },
    orderBy: { date: "asc" },
  });

export const getLessonOffering = async (type: LessonOffering["type"]) =>
  prisma.lessonOffering.findUnique({ where: { type } });

export const getVoucherOptions = async (): Promise<VoucherOption[]> =>
  prisma.voucherOption.findMany({ orderBy: { title: "asc" } });

export const getReports = async (): Promise<Report[]> =>
  prisma.report.findMany({ orderBy: { year: "desc" } });

export const getReportBySlug = async (slug: string) =>
  prisma.report.findUnique({ where: { slug } });
