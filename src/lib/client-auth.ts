// Client-side authentication utilities

export interface AuthError {
    message: string;
    field?: string;
}

export interface RegisterData {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface LoginData {
    username: string;
    password: string;
}

export interface GoogleLoginData {
    credential: string; // Google ID token
}

export interface AuthResponse {
    success: boolean;
    error?: AuthError;
    data?: any;
}

/**
 * Register a new user
 * @param data Registration data
 * @returns Response with success status and error information if any
 */
export async function registerUser(data: RegisterData): Promise<AuthResponse> {
    try {
        // Client-side validation
        if (!data.username || !data.email || !data.password || !data.confirmPassword) {
            return {
                success: false,
                error: { message: "All fields are required" }
            };
        }

        if (data.password !== data.confirmPassword) {
            return {
                success: false,
                error: { message: "Passwords do not match", field: "confirmPassword" }
            };
        }

        if (data.password.length < 8) {
            return {
                success: false,
                error: { message: "Password must be at least 8 characters long", field: "password" }
            };
        }

        // Call the API
        const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: {
                    message: typeof result.error === 'string' ? result.error : "Registration failed",
                    field: result.field
                }
            };
        }

        return {
            success: true,
            data: result.account
        };
    } catch (err) {
        return {
            success: false,
            error: {
                message: err instanceof Error ? err.message : "An unexpected error occurred"
            }
        };
    }
}

/**
 * Authenticate a user
 * @param data Login credentials
 * @returns Response with success status and auth tokens if successful
 */
export async function loginUser(data: LoginData): Promise<AuthResponse> {
    try {
        // Client-side validation
        if (!data.username || !data.password) {
            return {
                success: false,
                error: { message: "Username and password are required" }
            };
        }

        // Call the API
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: {
                    message: result.error || "Invalid username or password"
                }
            };
        }

        return {
            success: true,
            data: result
        };
    } catch (err) {
        return {
            success: false,
            error: {
                message: err instanceof Error ? err.message : "An unexpected error occurred"
            }
        };
    }
}

/**
 * Authenticate with Google
 * @param data Google credential data
 * @returns Response with success status and auth tokens if successful
 */
export async function loginWithGoogle(data: GoogleLoginData): Promise<AuthResponse> {
    try {
        // Client-side validation
        if (!data.credential) {
            return {
                success: false,
                error: { message: "Google credential is required" }
            };
        }

        // Call the API
        const response = await fetch("/api/auth/google", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: {
                    message: result.error || "Google authentication failed"
                }
            };
        }

        return {
            success: true,
            data: result
        };
    } catch (err) {
        return {
            success: false,
            error: {
                message: err instanceof Error ? err.message : "An unexpected error occurred"
            }
        };
    }
}
