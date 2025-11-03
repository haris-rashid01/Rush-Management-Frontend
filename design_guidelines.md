# Rush Corporation Company Portal - Design Guidelines

## Design Approach

**Selected System:** Material Design with corporate refinements
**Rationale:** Material Design excels at information-dense, productivity-focused applications with clear hierarchy and established interaction patterns. Perfect for internal employee portals requiring clarity and efficiency.

**Key Design Principles:**
- Clarity over decoration: Every element serves a functional purpose
- Hierarchical organization: Clear information architecture with nested navigation
- Efficient workflows: Minimize clicks to complete tasks
- Professional consistency: Enterprise-grade polish throughout

---

## Core Design Elements

### A. Typography

**Primary Font:** Inter (Google Fonts)
- Highly legible for extended reading
- Excellent at small sizes for data tables
- Professional without being corporate-stiff

**Type Scale:**
- **Page Titles:** 2xl (24px), font-semibold
- **Section Headers:** xl (20px), font-semibold  
- **Card/Widget Titles:** lg (18px), font-medium
- **Body Text:** base (16px), font-normal
- **Secondary/Meta Text:** sm (14px), font-normal
- **Captions/Labels:** xs (12px), font-medium uppercase tracking-wide

**Arabic Text (Duas Section):**
- **Font:** Amiri or Scheherazade (Google Fonts)
- **Size:** xl-2xl for Arabic, base for translations
- **Alignment:** Right-to-left for Arabic text

---

### B. Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, and 8
- **Micro spacing:** p-2, gap-2 (8px) - within components
- **Component padding:** p-4, p-6 (16px-24px) - cards, forms
- **Section spacing:** py-8, py-12 (32px-48px) - between major sections
- **Page margins:** px-6, px-8 (24px-32px) - content containers

**Grid Structure:**
- **Main Layout:** Fixed sidebar (w-64 on desktop, collapsible on mobile) + flex-1 main content area
- **Content Width:** max-w-7xl with px-6 on main content (not full bleed)
- **Dashboard Widgets:** grid-cols-1 md:grid-cols-2 lg:grid-cols-3 with gap-6
- **Data Tables:** Full width within content container with horizontal scroll on mobile

**Responsive Breakpoints:**
- Mobile: Base (< 768px) - stacked single column, hamburger sidebar
- Tablet: md (768px) - 2-column grids where appropriate
- Desktop: lg (1024px+) - full multi-column layouts, fixed sidebar

---

### C. Component Library

**1. Navigation Sidebar**
- Fixed position on desktop (w-64), overlay drawer on mobile
- Logo/branding at top with company name
- Collapsible section groups with chevron indicators
- Active state: light blue background (bg-blue-50), blue text, left border accent (border-l-4)
- Hover state: subtle background (bg-gray-50)
- Icon + label format with 16px icons, spacing between items (space-y-1)

**2. Dashboard Widgets**
- Card-based design with shadow-sm and rounded-lg borders
- Header with icon + title + optional action button
- Body with key metrics in large text (text-2xl font-bold) above labels
- Footer with "View Details" link or timestamp
- Quick access buttons with icon-only or icon + text variants

**3. Data Tables**
- Zebra striping for rows (alternate bg-gray-50)
- Sticky header with font-semibold column labels
- Action column on right with icon buttons (edit, delete)
- Pagination below table with page numbers + prev/next
- Search/filter bar above table with input field + filter dropdowns

**4. Forms**
- Single column layout with max-w-2xl for optimal reading
- Label above input (text-sm font-medium mb-2)
- Input fields with border, rounded corners, focus:ring-2 focus:ring-blue-500
- Helper text below inputs in text-sm text-gray-600
- Required field indicators with red asterisk
- Submit buttons at bottom-right, Cancel on left
- Multi-step forms with progress indicator at top

**5. Cards (Employee, Document, Dua)**
- White background with shadow-sm, rounded-lg, p-6
- Header area with title/name and status badge if applicable
- Content area with key information in definition list format
- Action buttons/links in footer, right-aligned
- Hover state: shadow-md transition

**6. Modals/Dialogs**
- Centered overlay with backdrop blur
- Max-width constraints (max-w-lg for forms, max-w-4xl for content)
- Header with title + close button (×)
- Scrollable body content
- Fixed footer with action buttons

**7. Notifications/Alerts**
- Toast notifications slide in from top-right
- Color-coded borders: blue (info), green (success), yellow (warning), red (error)
- Icon on left, message text, dismiss button on right
- Auto-dismiss after 5 seconds or manual close
- Prayer time notifications with prayer name, time remaining

**8. Buttons**
- **Primary:** Blue background, white text, px-4 py-2, rounded-md, font-medium
- **Secondary:** White background, blue border, blue text
- **Text/Ghost:** No background, blue text, hover:bg-blue-50
- **Icon Buttons:** Square (p-2), rounded, gray hover:bg-gray-100
- Consistent sizing: sm (px-3 py-1.5 text-sm), base (px-4 py-2), lg (px-6 py-3 text-lg)

---

### D. Page-Specific Layouts

**Dashboard/Homepage:**
- Welcome banner with greeting + current prayer time widget (full width, bg-blue-50, p-6, rounded-lg)
- 3-column stats grid below: Total Employees, Pending Leaves, Upcoming Events (each as metric cards)
- Quick actions section with 4 icon-labeled buttons in 2×2 or 4×1 grid
- Announcements feed on left (2/3 width), Upcoming prayers sidebar on right (1/3 width)

**Namaz Alarm Page:**
- Prayer times displayed in 5 cards (Fajr, Dhuhr, Asr, Maghrib, Isha) in grid
- Each card shows: prayer name, time, countdown, toggle for alarm
- Settings section with location input and notification preferences
- Current prayer highlighted with blue accent

**Duas Section:**
- Two-column layout on desktop: List navigation on left (1/3), content on right (2/3)
- Each Dua card displays: Arabic text (large, right-aligned), transliteration, English translation
- Audio play button if available, bookmark icon, share button
- Search bar at top, category filters below

**Timetable/Schedule:**
- Calendar view at top (week/month toggle)
- Below: list of events with date, time, title, description
- "Add Event" button top-right (primary blue)
- Each event row: time on left, title/description center, action icons right

**Leave Form:**
- Single-column centered form (max-w-2xl)
- Fields stacked with clear labels
- Date pickers with calendar dropdown
- Textarea for reason (rows-4)
- Submit button prominent at bottom
- For admin view: table of requests with approve/reject action buttons

**Onboarding/Employee Management:**
- Admin: Employee list as data table with search, filters (department, role)
- "Add Employee" button triggers modal/slide-over form
- Employee cards show: photo (rounded-full, 48px), name, role, department, joining date
- Edit/delete actions on hover or always visible as icons

**Documents Section:**
- Category tabs at top (HR, Policies, Training, Projects)
- Document cards in grid below with: icon, filename, upload date, file size, download button
- Admin: Upload button opens file picker with drag-and-drop zone
- Version history shown as expandable accordion per document

**Company Info:**
- Hero section with company image or illustration
- Mission/Vision in two-column cards
- Timeline of milestones with alternating left/right layout
- Stats in 4-column grid (established year, employees, projects, etc.)

**Policies:**
- Accordion-style expandable sections for each policy category
- Each section shows: policy title, summary, "Download PDF" button
- Table of contents sidebar for quick navigation on longer pages

**Contact Page:**
- Two-column split: Contact form on left (max-w-lg), info + map on right
- Form fields: Name, Email, Subject, Message
- Right side: Address, Phone, Email, Office Hours
- Embedded Google Maps below (h-64 rounded-lg)

---

## Images

**Dashboard:** Small illustrative icons for widgets (use Heroicons CDN), no large hero image needed

**Company Info Page:** 
- Hero image at top (full width, h-96): Modern office environment or team collaboration photo
- Optional: Embedded company video or image gallery showcasing workplace

**Duas Section:** Decorative Islamic pattern as subtle background watermark (low opacity) - can use SVG pattern

**Contact Page:** Embedded Google Maps showing office location

**Employee Cards:** Profile photos (circular, 48×48px for lists, 96×96px for detail views)

**Document Icons:** Standard file type icons from icon library (PDF, DOCX, etc.)

All images should maintain professional, corporate aesthetic with natural lighting and authentic representation. Avoid stock photo clichés.

---

## Accessibility & Polish

- Keyboard navigation throughout (focus:ring-2 on all interactive elements)
- ARIA labels on icon-only buttons
- Color contrast ratios meet WCAG AA standards
- Loading states with skeleton screens or spinners
- Empty states with helpful illustrations and action prompts
- Success confirmations after form submissions
- Error validation inline below fields in red text