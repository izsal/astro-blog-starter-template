// Admin Authentication Helper (PRD Section 30)

export const ADMIN_COOKIE_NAME = "qblog_admin_token";
export const DEFAULT_ADMIN_TOKEN = "qwarts-admin-2026";

export function getExpectedAdminToken(env?: Record<string, any>): string {
	return env?.ADMIN_TOKEN || env?.ADMIN_SECRET || DEFAULT_ADMIN_TOKEN;
}

export function verifyAdminSession(cookieHeader: string | null, env?: Record<string, any>): boolean {
	if (!cookieHeader) return false;

	const expected = getExpectedAdminToken(env);
	const cookies = cookieHeader.split(";").reduce((acc, c) => {
		const [k, v] = c.trim().split("=");
		if (k && v) acc[k] = decodeURIComponent(v);
		return acc;
	}, {} as Record<string, string>);

	return cookies[ADMIN_COOKIE_NAME] === expected;
}
