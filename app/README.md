# 回家作业系统 iOS App 编译指南

## 环境要求

- macOS 系统
- Xcode 14.0 或更高版本
- 有效的 Apple Developer 账号（用于在真机上测试）

## 编译步骤

### 1. 将项目复制到 macOS 系统

将 `app` 文件夹复制到 Mac 电脑上，或通过以下方式传输：
- U盘/移动硬盘
- 网络共享
- Git 仓库（推荐）

### 2. 用 Xcode 打开项目

```bash
cd /path/to/app
open HomeworkApp.xcodeproj
```

或在 Finder 中双击 `HomeworkApp.xcodeproj` 文件。

### 3. 配置项目

1. 在 Xcode 中，点击左侧导航栏顶部的项目名 `HomeworkApp`
2. 选择 `TARGETS` → `HomeworkApp`
3. 在 `Signing & Capabilities` 标签页：
   - 勾选 `Automatically manage signing`
   - 选择你的 Team（Apple Developer 账号）
   - 修改 Bundle Identifier（如：`com.yourname.HomeworkApp`）

### 4. 修改服务器地址

打开 `HomeworkApp/Services/APIService.swift`，修改 `baseURL`：

```swift
class APIService {
    static let shared = APIService()
    // 将 localhost 改为你的服务器实际 IP 地址
    private let baseURL = "http://192.168.1.100:3000/api"
    // 如果后端和手机在同一台 Mac 上测试，可以用 localhost
    // private let baseURL = "http://localhost:3000/api"
}
```

**注意**：iOS 模拟器可以使用 `localhost`，但真机需要服务器 IP 地址。

### 5. 选择运行设备

- 模拟器：点击 Xcode 顶部设备选择框，选择如 `iPhone 15`
- 真机：连接 iPhone，在设备选择框中选择你的 iPhone

### 6. 编译运行

点击 Xcode 左上角的 **播放按钮** ▶ 或按 `Cmd + R` 编译并运行。

## 常见问题

### 1. 无法连接到服务器
- 确认后端服务器已启动
- 确认手机/模拟器和后端在同一网络
- 检查 `APIService.swift` 中的 IP 地址是否正确
- 如果是真机测试，确保 Mac 和 iPhone 在同一 Wi-Fi

### 2. 权限问题
- 进入 `设置` → `通用` → `设备管理`，信任你的开发者证书

### 3. HTTP 请求被阻止
iOS 9+ 默认只允许 HTTPS。需要修改 `Info.plist` 允许 HTTP：

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>
```

## 打包发布

### 归档（Archive）
1. 选择真机设备（或 `Any iOS Device`）
2. 菜单 `Product` → `Archive`
3. 归档完成后，在 Organizer 中点击 `Distribute App`

### 发布到 App Store
1. 选择 `App Store Connect`
2. 按照向导上传
3. 登录 https://appstoreconnect.apple.com 提交审核

## 项目结构

```
app/
├── HomeworkApp.xcodeproj/       # Xcode 项目文件
└── HomeworkApp/
    ├── HomeworkApp.swift       # 应用入口
    ├── Models/
    │   └── Homework.swift     # 数据模型
    ├── Views/
    │   ├── LoginView.swift    # 登录页面
    │   ├── SubjectListView.swift  # 学科列表
    │   └── HomeworkListView.swift  # 作业列表
    └── Services/
        └── APIService.swift   # API 服务
```

## 功能说明

- **登录/注册**：与 Web 端共用后端账户
- **学科列表**：显示所有学科，点击进入查看作业
- **作业列表**：显示该学科下的所有作业
- **开始作业**：点击"开始"按钮，状态变为"进行中"，记录开始时间
- **完成作业**：点击"完成"按钮，状态变为"已完成"，记录完成时间

## 技术支持

如有问题，请检查：
1. 后端服务是否正常运行（http://你的IP:3000/api/health）
2. iOS 控制台日志（Xcode → View → Debug Area → Activate Console）
3. 网络连接是否正常
