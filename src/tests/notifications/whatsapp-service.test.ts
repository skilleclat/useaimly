import { describe, it, expect } from "vitest";
import { formatWhatsAppDigestText, dispatchWhatsAppDigest } from "@/lib/notifications/whatsapp-service";

describe("WhatsApp Dispatch Service Test Suite", () => {
  it("formats WhatsApp markdown digest text correctly with bold tags and AI tip", () => {
    const text = formatWhatsAppDigestText({
      phoneNumber: "+254712345678",
      goalTitle: "Buy Land in Nanyuki",
      targetDate: "Dec 2028",
      projectedDate: "Aug 2027",
      monthlyCapacity: 120000,
      currency: "KES",
      aiTip: "You are 4 months ahead of schedule!",
    });

    expect(text).toContain("✨ *UseAimly AI Intelligence Dispatch*");
    expect(text).toContain('Buy Land in Nanyuki');
    expect(text).toContain("Dec 2028");
    expect(text).toContain("Aug 2027");
    expect(text).toContain("KES 120,000");
    expect(text).toContain("You are 4 months ahead of schedule!");
  });

  it("dispatches digest and returns valid wa.me direct WhatsApp URL and dispatch ID", async () => {
    const result = await dispatchWhatsAppDigest({
      phoneNumber: "+254712345678",
      goalTitle: "Emergency Fund",
      daysRemaining: 15,
    });

    expect(result.success).toBe(true);
    expect(result.dispatchId).toMatch(/^wa_msg_\d+/);
    expect(result.status).toBe("SENT");
    expect(result.whatsappUrl).toContain("https://wa.me/254712345678?text=");
    expect(result.message).toBeDefined();
  });
});
