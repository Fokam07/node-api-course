const { defineConfig } = require("@prisma/internals");

module.exports = defineConfig({
  projects: [
    {
      name: "day3",
      schema: "./prisma/schema.prisma",
      prismaUrl: process.env.DATABASE_URL,
    },
  ],
});
