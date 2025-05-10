import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { db } from "~/server/db";
import { regions, candidates, stations, votes } from "~/server/db/schema";
import { eq, sql } from "drizzle-orm";

// Input schema for updating field names
const updateFieldNameSchema = z.object({
  tableName: z.enum(["regions", "candidates", "stations", "votes"]),
  id: z.number(),
  fieldName: z.string(),
  newValue: z.string().min(1),
});

export const adminRouter = createTRPCRouter({
  // Update a field name in any table
  updateFieldName: publicProcedure
    .input(updateFieldNameSchema)
    .mutation(async ({ input }) => {
      const { tableName, id, fieldName, newValue } = input;

      // Only allow updating the name field
      if (fieldName !== "name") {
        throw new Error("Only the name field can be edited");
      }

      // Update the appropriate table based on tableName
      switch (tableName) {
        case "regions":
          await db
            .update(regions)
            .set({ name: newValue })
            .where(eq(regions.id, id));
          break;
        case "candidates":
          await db
            .update(candidates)
            .set({ name: newValue })
            .where(eq(candidates.id, id));
          break;
        case "stations":
          await db
            .update(stations)
            .set({ name: newValue })
            .where(eq(stations.id, id));
          break;
        case "votes":
          // Votes table doesn't have a name field to update
          throw new Error("Votes table doesn't have a name field");
        default:
          throw new Error("Invalid table name");
      }

      return { success: true };
    }),
});
