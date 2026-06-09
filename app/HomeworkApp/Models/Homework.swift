import Foundation

struct Subject: Codable, Identifiable {
    let id: Int
    let name: String
    let description: String?
}

struct Homework: Codable, Identifiable {
    let id: Int
    let user_id: Int
    let subject_id: Int
    let title: String
    let content: String?
    let status: String
    let deadline: String?
    let start_time: String?
    let complete_time: String?
    let subject_name: String?
    let created_at: String
    let updated_at: String
    
    var formattedDeadline: String {
        guard let deadline = deadline else { return "无截止时间" }
        return String(deadline.prefix(10))
    }
}

struct LoginResponse: Codable {
    let token: String
    let user: User
}

struct User: Codable {
    let id: Int
    let username: String
}

struct ApiResponse<T: Codable>: Codable {
    let data: T?
    let message: String?
    let error: String?
    let total: Int?
}
