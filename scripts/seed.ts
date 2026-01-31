import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

import {
  defaultCourseSessions,
  defaultCourses,
  defaultLessonOfferings,
  defaultReports,
  defaultSiteSettings,
  defaultVoucherOptions,
} from "../lib/seed-data";

const prisma = new PrismaClient();

const adminEmail = process.env.ADMIN_EMAIL || "admin@fliegenfischen.local";
const adminPassword = process.env.ADMIN_PASSWORD || "admin1234";
const adminName = process.env.ADMIN_NAME || "Admin";

async function main() {
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      passwordHash,
      role: "SUPER_ADMIN",
      isActive: true,
    },
    create: {
      email: adminEmail,
      name: adminName,
      passwordHash,
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {
      name: defaultSiteSettings.name,
      tagline: defaultSiteSettings.tagline,
      location: defaultSiteSettings.location,
      contact: defaultSiteSettings.contact,
      navLinks: defaultSiteSettings.navLinks,
      footerLinks: defaultSiteSettings.footerLinks,
      categorySummaries: defaultSiteSettings.categorySummaries,
      homeHero: defaultSiteSettings.homeHero,
      aboutSection: defaultSiteSettings.aboutSection,
      aboutPage: defaultSiteSettings.aboutPage,
      homeSections: defaultSiteSettings.homeSections,
      uspItems: defaultSiteSettings.uspItems,
      faqs: defaultSiteSettings.faqs,
      testimonials: defaultSiteSettings.testimonials,
      testimonialSection: defaultSiteSettings.testimonialSection,
      coursePathSteps: defaultSiteSettings.coursePathSteps,
    },
    create: {
      id: 1,
      name: defaultSiteSettings.name,
      tagline: defaultSiteSettings.tagline,
      location: defaultSiteSettings.location,
      contact: defaultSiteSettings.contact,
      navLinks: defaultSiteSettings.navLinks,
      footerLinks: defaultSiteSettings.footerLinks,
      categorySummaries: defaultSiteSettings.categorySummaries,
      homeHero: defaultSiteSettings.homeHero,
      aboutSection: defaultSiteSettings.aboutSection,
      aboutPage: defaultSiteSettings.aboutPage,
      homeSections: defaultSiteSettings.homeSections,
      uspItems: defaultSiteSettings.uspItems,
      faqs: defaultSiteSettings.faqs,
      testimonials: defaultSiteSettings.testimonials,
      testimonialSection: defaultSiteSettings.testimonialSection,
      coursePathSteps: defaultSiteSettings.coursePathSteps,
    },
  });

  for (const course of defaultCourses) {
    await prisma.course.upsert({
      where: { slug: course.slug },
      update: {
        title: course.title,
        level: course.level,
        category: course.category,
        summary: course.summary,
        description: course.description,
        imageSrc: course.imageSrc,
        imageAlt: course.imageAlt,
        highlights: course.highlights,
        duration: course.duration,
        priceCHF: course.priceCHF,
        maxParticipants: course.maxParticipants,
        location: course.location,
        equipment: course.equipment,
        includes: course.includes,
        prerequisites: course.prerequisites,
      },
      create: {
        slug: course.slug,
        title: course.title,
        level: course.level,
        category: course.category,
        summary: course.summary,
        description: course.description,
        imageSrc: course.imageSrc,
        imageAlt: course.imageAlt,
        highlights: course.highlights,
        duration: course.duration,
        priceCHF: course.priceCHF,
        maxParticipants: course.maxParticipants,
        location: course.location,
        equipment: course.equipment,
        includes: course.includes,
        prerequisites: course.prerequisites,
      },
    });
  }

  const courses = await prisma.course.findMany();
  await prisma.courseSession.deleteMany();
  for (const session of defaultCourseSessions) {
    const course = courses.find((item) => item.slug === session.courseSlug);
    if (!course) continue;
    await prisma.courseSession.create({
      data: {
        courseId: course.id,
        date: new Date(session.date),
        startTime: session.startTime,
        endTime: session.endTime,
        location: session.location,
        priceCHF: session.priceCHF,
        availableSpots: session.availableSpots,
        status: session.status,
        notes: session.notes,
      },
    });
  }

  for (const offering of defaultLessonOfferings) {
    await prisma.lessonOffering.upsert({
      where: { type: offering.type },
      update: {
        title: offering.title,
        description: offering.description,
        priceCHF: offering.priceCHF,
        minHours: offering.minHours,
        additionalPersonCHF: offering.additionalPersonCHF,
        bullets: offering.bullets,
      },
      create: {
        type: offering.type,
        title: offering.title,
        description: offering.description,
        priceCHF: offering.priceCHF,
        minHours: offering.minHours,
        additionalPersonCHF: offering.additionalPersonCHF,
        bullets: offering.bullets,
      },
    });
  }

  await prisma.voucherOption.deleteMany();
  for (const option of defaultVoucherOptions) {
    await prisma.voucherOption.create({
      data: {
        title: option.title,
        description: option.description,
        kind: option.kind,
        values: option.values,
      },
    });
  }

  for (const report of defaultReports) {
    await prisma.report.upsert({
      where: { slug: report.slug },
      update: {
        title: report.title,
        location: report.location,
        year: report.year,
        summary: report.summary,
        highlights: report.highlights,
        body: report.body,
      },
      create: {
        slug: report.slug,
        title: report.title,
        location: report.location,
        year: report.year,
        summary: report.summary,
        highlights: report.highlights,
        body: report.body,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
