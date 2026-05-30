import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function assertAdmin(supabase: any, userId: string) {
  const { data: roles, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  if (error) throw new Error("Không thể kiểm tra quyền.");
  if (!roles?.some((r: any) => r.role === "admin")) {
    throw new Error("Bạn không có quyền thực hiện thao tác này.");
  }
}

const CreateSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(100),
  full_name: z.string().trim().min(1).max(100),
  phone: z.string().trim().max(20).optional().default(""),
  role: z.enum(["customer", "admin"]).default("customer"),
});

export const createUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => CreateSchema.parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.full_name, phone: data.phone },
    });
    if (error) throw new Error(error.message);

    const newUserId = created.user?.id;
    if (!newUserId) throw new Error("Tạo người dùng thất bại.");

    if (data.role === "admin") {
      await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: newUserId, role: "admin" });
    }

    return { id: newUserId };
  });

const UpdateSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().trim().min(1).max(100),
  phone: z.string().trim().max(20).optional().default(""),
  status: z.enum(["active", "inactive"]).default("active"),
  role: z.enum(["customer", "admin"]).default("customer"),
  password: z.string().min(6).max(100).optional().or(z.literal("")),
});

export const updateUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => UpdateSchema.parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);

    const { error: pErr } = await supabaseAdmin
      .from("profiles")
      .update({
        full_name: data.full_name,
        phone: data.phone,
        status: data.status,
      })
      .eq("id", data.id);
    if (pErr) throw new Error(pErr.message);

    if (data.password) {
      const { error: passErr } = await supabaseAdmin.auth.admin.updateUserById(data.id, {
        password: data.password,
      });
      if (passErr) throw new Error(passErr.message);
    }

    // Sync role: clear all then set the chosen one
    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.id);
    await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: data.id, role: data.role });

    return { ok: true };
  });

const DeleteSchema = z.object({ id: z.string().uuid() });

export const deleteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => DeleteSchema.parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    if (data.id === context.userId) {
      throw new Error("Không thể xóa chính tài khoản đang đăng nhập.");
    }

    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.id);
    if (error) throw new Error(error.message);
    // Best-effort cleanup (profiles/user_roles may cascade or not)
    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.id);
    await supabaseAdmin.from("profiles").delete().eq("id", data.id);
    return { ok: true };
  });
