// backend/utils/webhookService.js
import axios from 'axios';

export const sendDiscordAlert = async (algorithm, aiReport) => {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    
    if (!webhookUrl) {
        console.log("⚠️ Discord Webhook URL not found in .env. Skipping Discord alert.");
        return;
    }

    try {
        console.log("📡 Broadcasting threat to Discord ecosystem...");

        // Discord expects a specific JSON structure for "Rich Embeds"
        const payload = {
            username: "SentinelGraph AI",
            avatar_url: "https://i.imgur.com/rN9m8e3.png", // A cool generic AI/Security logo
            embeds: [
                {
                    title: "🚨 CRITICAL SECURITY ALERT",
                    color: 16711680, // Hex code for Red converted to integer
                    description: `**AI Threat Assessment:**\n${aiReport}`,
                    fields: [
                        {
                            name: "Triggered Algorithm",
                            value: `\`${algorithm}\``,
                            inline: true
                        },
                        {
                            name: "System Status",
                            value: "⚠️ Immediate Review Required",
                            inline: true
                        }
                    ],
                    footer: {
                        text: `SentinelGraph Autonomous Engine • ${new Date().toLocaleTimeString()}`
                    }
                }
            ]
        };

        await axios.post(webhookUrl, payload);
        console.log("✅ Discord broadcast successful!");

    } catch (error) {
        console.error("❌ Failed to broadcast to Discord:", error.message);
    }
};