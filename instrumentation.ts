export async function register() {

    const { startNewsletterQueue } = await import("./lib/newsletter-queue");
    startNewsletterQueue();
}
