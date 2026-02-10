# 💎 Billing System - Rashmi Gems

A complete billing/invoice generation system built with Next.js, React, and Tailwind CSS.

## 📋 Features

- ✅ **Admin Login System** - Secure authentication
- ✅ **Invoice Generation** - Create professional invoices
- ✅ **Bill Preview** - See invoice before printing
- ✅ **Print Support** - Print-ready invoice format
- ✅ **Auto Calculations** - Automatic amount and tax calculations
- ✅ **Multiple Products** - Add/remove products dynamically
- ✅ **GST Support** - CGST, SGST, and IGST fields
- ✅ **Responsive Design** - Works on all devices

## 🚀 How to Run This Application

### Prerequisites

Make sure you have **Node.js** installed on your computer.

- Download Node.js from: https://nodejs.org/ (LTS version recommended)
- To check if Node.js is installed, open terminal/command prompt and type:
  ```bash
  node --version
  npm --version
  ```

### Step 1: Extract/Download the Project

Extract the `billing-system` folder to your desired location.

### Step 2: Open Terminal/Command Prompt

- **Windows**: Press `Win + R`, type `cmd`, press Enter
- **Mac**: Press `Cmd + Space`, type `terminal`, press Enter
- **Linux**: Press `Ctrl + Alt + T`

### Step 3: Navigate to Project Folder

```bash
cd path/to/billing-system
```

For example:
```bash
cd C:\Users\YourName\Desktop\billing-system
```

### Step 4: Install Dependencies

Run this command to install all required packages:

```bash
npm install
```

This will take 1-2 minutes. Wait for it to complete.

### Step 5: Start the Application

Run this command to start the development server:

```bash
npm run dev
```

### Step 6: Open in Browser

Once the server starts, you'll see a message like:
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

Open your browser and go to:
```
http://localhost:3000
```

## 🔐 Login Credentials

```
Username: admin
Password: admin123
```

## 📖 How to Use

1. **Login** - Use the credentials above
2. **Fill Invoice Details**:
   - Invoice Number
   - Date
   - Bill To Party details
   - Ship To Party details (optional)
   - Add products (click "Add Product" for more)
   - Enter CGST/SGST/IGST if applicable

3. **Generate Bill** - Click "Generate Bill" button
4. **Preview** - Review the generated invoice
5. **Edit** - Click "Edit" to modify details
6. **Print** - Click "Print" to print the invoice

## 🛠️ Technology Stack

- **Next.js 14** - React framework
- **React 18** - JavaScript library
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## 📁 Project Structure

```
billing-system/
├── pages/
│   ├── _app.js          # Main app component
│   └── index.js         # Billing page
├── styles/
│   └── globals.css      # Global styles
├── package.json         # Dependencies
├── next.config.js       # Next.js config
├── tailwind.config.js   # Tailwind config
├── postcss.config.js    # PostCSS config
└── README.md           # This file
```

## 🔄 Available Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run linting
```

## ⚙️ Customization

### Change Company Name/Details

Edit `/pages/index.js` and find the invoice header section to update:
- Company name
- GSTIN
- Address
- Contact details

### Change Login Credentials

Edit `/pages/index.js` and find:
```javascript
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};
```

### Styling

Modify Tailwind classes in `/pages/index.js` or add custom CSS in `/styles/globals.css`

## 🐛 Troubleshooting

### Port 3000 already in use?
```bash
# Kill the process using port 3000
npx kill-port 3000

# Or run on different port
npm run dev -- -p 3001
```

### Module not found errors?
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### Build errors?
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

## 📱 Production Deployment

To build for production:

```bash
npm run build
npm start
```

Or deploy to Vercel (free hosting):
1. Push code to GitHub
2. Go to https://vercel.com
3. Import your repository
4. Deploy!

## 💡 Future Enhancements

- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] PDF download feature
- [ ] Email invoices
- [ ] Invoice history/search
- [ ] Multiple user roles
- [ ] Customer management
- [ ] Reports and analytics

## 📞 Support

For issues or questions:
- Create an issue in the repository
- Contact the developer

## 📄 License

This project is open source and available under the MIT License.

---

**Made with ❤️ for Rashmi Gems**
