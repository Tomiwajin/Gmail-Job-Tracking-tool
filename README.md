# 📧 Job Application Tracker - Gmail Integration

An intelligent job application tracking system that automatically parses your Gmail to extract and organize job application emails, providing analytics and export capabilities.

## 🚀 Live Demo

[**View Live App**](https://job-app-tracker-gmail.vercel.app)

## ⚠️ Note: This app is currently in the testing phase and limited to 100 users due to Gmail API quota restrictions.

## ✨ Features

### 🤖 Automatic Email Processing
- **Smart Gmail Integration**: Connects to your Gmail account via OAuth2 authentication
- **Intelligent Email Parsing**: Automatically detects job application emails using advanced pattern matching
- **Company & Role Extraction**: Uses regex patterns to extract company names and job roles from email content
- **Status Classification**: Automatically categorizes applications as Applied, Interview, Rejected, Offer, etc.
- **Bulk Email Filtering**: Filters out job board spam and promotional emails

### 📊 Analytics Dashboard
- **Application Statistics**: Track success rates, response rates, and application trends
- **Status Distribution**: Visual breakdown of application statuses
- **Timeline Analytics**: Monitor application activity over time
- **Performance Metrics**: Calculate interview and offer conversion rates

### 🔍 Advanced Filtering & Search
- **Multi-criteria Search**: Filter by company, role, email, or status
- **Date Range Filtering**: Focus on specific time periods
- **Real-time Results**: Instant filtering with no page reloads

### 📤 Export Capabilities
- **Excel Spreadsheets**: Export data as professional .xlsx files
- **CSV Export**: Simple comma-separated format for external tools
- **Analytics Reports**: Comprehensive reports with summary statistics
- **Google Sheets Compatible**: Formatted for easy import into Google Sheets

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Modern React component library
- **Lucide React** - Beautiful icons

### Backend
- **Next.js API Routes** - Serverless backend functions
- **Google APIs** - Gmail and OAuth2 integration
- **googleapis** - Official Google API client

### Data & Export
- **ExcelJS** - Excel file generation
- **Zustand** - Lightweight state management
- **date-fns** - Date manipulation utilities

### Deployment
- **Vercel** - Zero-config deployment platform
- **Environment Variables** - Secure credential management

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Google Cloud Console account
- Gmail account for testing

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/job-app-tracker-gmail.git
cd job-app-tracker-gmail
npm install
```

### 2. Google Cloud Setup
1. Create a project in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Gmail API and Google+ API
3. Create OAuth2 credentials
4. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/route`

### 3. Environment Variables
Create `.env.local`:
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google
```

### 4. Run Development Server
```bash
npm run dev
```
Visit `http://localhost:3000`

## 📋 How It Works

### Email Processing Flow
1. **OAuth Authentication**: Secure Gmail access via Google OAuth2
2. **Smart Querying**: Searches emails using job-related keywords
3. **Content Analysis**: Extracts company names, job titles, and application status
4. **Data Normalization**: Cleans and structures extracted information
5. **Duplicate Prevention**: Avoids processing the same email multiple times

### Pattern Recognition
The system uses sophisticated regex patterns to identify:
- **Job Applications**: "thank you for applying", "application received"
- **Interview Invitations**: "next steps", "would like to invite you"
- **Rejections**: "not selected", "pursue other candidates"
- **Company Names**: Extracts from email signatures and content
- **Job Titles**: Identifies roles from subject lines and body text

## 🎯 Use Cases

- **Job Seekers**: Track all applications automatically without manual entry
- **Career Coaches**: Help clients organize their job search process
- **Recruiters**: Monitor candidate application patterns
- **Students**: Manage internship and entry-level job applications

## 🔒 Privacy & Security

- **OAuth2 Authentication**: Industry-standard secure authentication
- **Read-Only Access**: Only reads emails, never modifies or sends
- **Local Processing**: Email content processed client-side when possible
- **No Data Storage**: Emails are not stored on external servers
- **Secure Cookies**: HTTP-only cookies for token management

## 🚀 Deployment

### Vercel (Recommended)
1. Fork this repository
2. Connect your GitHub to Vercel
3. Set environment variables in Vercel dashboard
4. Update Google Cloud Console with production redirect URI
5. Deploy automatically

### Manual Deployment
```bash
npm run build
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Google APIs](https://developers.google.com/gmail/api) for Gmail integration
- [Vercel](https://vercel.com) for seamless deployment
- [Next.js](https://nextjs.org) team for the amazing framework

## 📞 Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- [Email Me](oluwatomiwajinadu@gmail.com) directly

---

⭐ **Star this repository if it helped you track your job applications more effectively!**
