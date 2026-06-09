import SwiftUI

@main
struct HomeworkApp: App {
    @State private var isLoggedIn = UserDefaults.standard.string(forKey: "token") != nil
    
    var body: some Scene {
        WindowGroup {
            if isLoggedIn {
                SubjectListView(isLoggedIn: $isLoggedIn)
            } else {
                LoginView(isLoggedIn: $isLoggedIn)
            }
        }
    }
}
