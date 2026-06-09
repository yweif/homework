import SwiftUI

struct HomeworkListView: View {
    let subject: Subject
    @State private var homeworkList: [Homework] = []
    
    var body: some View {
        List(homeworkList) { homework in
            VStack(alignment: .leading, spacing: 8) {
                Text(homework.title)
                    .font(.headline)
                
                HStack {
                    Text("状态: \(homework.status)")
                        .foregroundColor(statusColor(homework.status))
                    Spacer()
                    Text("截止: \(homework.formattedDeadline)")
                        .font(.caption)
                        .foregroundColor(.gray)
                }
                
                if let content = homework.content {
                    Text(content)
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .lineLimit(2)
                }
                
                HStack {
                    if homework.status == "未开始" {
                        Button("开始") {
                            updateStatus(homework: homework, newStatus: "进行中")
                        }
                        .buttonStyle(BorderlessButtonStyle())
                        .foregroundColor(.blue)
                    }
                    
                    if homework.status == "进行中" {
                        Button("完成") {
                            updateStatus(homework: homework, newStatus: "已完成")
                        }
                        .buttonStyle(BorderlessButtonStyle())
                        .foregroundColor(.green)
                    }
                }
            }
            .padding(.vertical, 4)
        }
        .navigationTitle(subject.name)
        .onAppear {
            loadHomework()
        }
    }
    
    func statusColor(_ status: String) -> Color {
        switch status {
        case "未开始": return .gray
        case "进行中": return .orange
        case "已完成": return .green
        default: return .black
        }
    }
    
    func loadHomework() {
        guard let token = UserDefaults.standard.string(forKey: "token") else { return }
        
        APIService.shared.getHomework(token: token, subjectId: subject.id) { result in
            switch result {
            case .success(let homework):
                self.homeworkList = homework
            case .failure(let error):
                print("加载作业失败: \(error)")
            }
        }
    }
    
    func updateStatus(homework: Homework, newStatus: String) {
        guard let token = UserDefaults.standard.string(forKey: "token") else { return }
        
        APIService.shared.updateHomeworkStatus(token: token, homeworkId: homework.id, status: newStatus) { result in
            switch result {
            case .success:
                loadHomework()
            case .failure(let error):
                print("更新状态失败: \(error)")
            }
        }
    }
}

struct HomeworkListView_Previews: PreviewProvider {
    static var previews: some View {
        HomeworkListView(subject: Subject(id: 1, name: "数学", description: nil))
    }
}
