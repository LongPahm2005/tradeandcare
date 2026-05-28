import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const InputSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(100),
  full_name: z.string().trim().min(1).max(100),
  phone: z.string().trim().max(20).optional().default(""),
  role: z.enum(["customer", "admin"]).default("customer"),
});

export const createUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data, context }) => {
    // Verify caller is admin
    const { data: roles, error: roleErr } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    if (roleErr) throw new Error("Không thể kiểm tra quyền.");
    if (!roles?.some((r) => r.role === "admin")) {
      throw new Error("Bạn không có quyền thực hiện thao tác này.");
    }

    // Create the user (admin bypass)
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.full_name, phone: data.phone },
    });
    if (error) throw new Error(error.message);

    const newUserId = created.user?.id;
    if (!newUserId) throw new Error("Tạo người dùng thất bại.");

    // If admin role requested, upsert (trigger already inserts 'customer')
    if (data.role === "admin") {
      await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: newUserId, role: "admin" });
    }

    return { id: newUserId };
  });
