// Minimal in-memory store with optional future Mongo persistence
const SESSIONS = new Map();

export async function getSession(conversationId) {
	return SESSIONS.get(conversationId);
}

export async function saveSession(session) {
	SESSIONS.set(session.conversationId, session);
}
