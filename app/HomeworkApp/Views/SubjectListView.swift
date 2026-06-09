import SwiftUI

struct SubjectListView: View {
    @State private var subjects: [Subject] = []
    @State private var isLoggedIn = true
    
    var body: some View {
        NavigationView {
            List(subjects) { subject in
                NavigationLink(destination: HomeworkListView(subject: subject)) {
                    HStack {
                        Text(subject.name)
                            .font(.headline)
                        Spacer()
                        Image(systemName: "chevron.right")
                            .foregroundColor(.gray)
                    }
                }
            }
            .navigationTitle("学科列表")
            .navigationBarItems(trailing: Button("退出") {
                UserDefaults.standard.removeObject(forKey: "token")
                isLoggedIn = false
            })
            .onAppear {
                loadSubjects()
            }
        }
    }
    
    func loadSubjects() {
        guard let token = UserDefaults.standard.string(forKey: "token") else { return }
        
        APIService.shared.getSubjects(token: token) { result in
            switch result {
            case .success(let subjects):
                self.subjects = subjects
            case .failure(let error):
                print("加载学科失败: \(error)")
            }
        }
    }
}

struct SubjectListView_Previews: PreviewProvider {
    static var previews: some View {
        SubjectListView()
    }
}
