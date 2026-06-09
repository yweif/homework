import Foundation

class APIService {
    static let shared = APIService()
    private let baseURL = "http://localhost:3000/api"
    
    private init() {}
    
    func login(username: String, password: String, completion: @escaping (Result<LoginResponse, Error>) -> Void) {
        guard let url = URL(string: "\(baseURL)/auth/login") else { return }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body = ["username": username, "password": password]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            
            guard let data = data else { return }
            
            do {
                let response = try JSONDecoder().decode(LoginResponse.self, from: data)
                completion(.success(response))
            } catch {
                completion(.failure(error))
            }
        }.resume()
    }
    
    func getSubjects(token: String, completion: @escaping (Result<[Subject], Error>) -> Void) {
        guard let url = URL(string: "\(baseURL)/subjects") else { return }
        
        var request = URLRequest(url: url)
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            
            guard let data = data else { return }
            
            do {
                let response = try JSONDecoder().decode(ApiResponse<[Subject]>.self, from: data)
                if let subjects = response.data {
                    completion(.success(subjects))
                }
            } catch {
                completion(.failure(error))
            }
        }.resume()
    }
    
    func getHomework(token: String, subjectId: Int? = nil, completion: @escaping (Result<[Homework], Error>) -> Void) {
        var urlString = "\(baseURL)/homework"
        if let subjectId = subjectId {
            urlString += "?subject_id=\(subjectId)"
        }
        
        guard let url = URL(string: urlString) else { return }
        
        var request = URLRequest(url: url)
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            
            guard let data = data else { return }
            
            do {
                let response = try JSONDecoder().decode(ApiResponse<[Homework]>.self, from: data)
                if let homework = response.data {
                    completion(.success(homework))
                }
            } catch {
                completion(.failure(error))
            }
        }.resume()
    }
    
    func updateHomeworkStatus(token: String, homeworkId: Int, status: String, completion: @escaping (Result<Void, Error>) -> Void) {
        guard let url = URL(string: "\(baseURL)/homework/\(homeworkId)/status") else { return }
        
        var request = URLRequest(url: url)
        request.httpMethod = "PATCH"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        
        let body = ["status": status]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            completion(.success(()))
        }.resume()
    }
}
