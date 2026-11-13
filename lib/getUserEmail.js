import { currentUser } from "@clerk/nextjs/server";

export async function getUserEmail() {
  try {
    const user = await currentUser();
    if (!user) {
      return null;
    }

    const email =
      user.emailAddresses?.find((e) => e.id === user.primaryEmailAddressId)
        ?.emailAddress ||
      user.primaryEmailAddress?.emailAddress ||
      user.emailAddresses?.[0]?.emailAddress ||
      null;

    return email;
  } catch (err) {
    console.error("Error retrieving user email:", err);
    return null;
  }
}

export default getUserEmail;

