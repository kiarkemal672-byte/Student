'use strict';
/* ═══════════════════════════════════════════════════════════════
   የቂራአት መከታተያ — Qira'at Tracker
   js/app.js — المنطق الكامل + إصلاحات التثبيت والرسالة الأمهرية
═══════════════════════════════════════════════════════════════ */

/* ─────────────── أدوات مساعدة ─────────────── */
const $  = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function addDaysISO(iso, n) {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/* ─────────────── 1) الترجمة (i18n) ─────────────── */
const I18N = {
  am: {
    appTitle:'የቂራአት መከታተያ', appSubtitle:'የተማሪዎች የቂራአት መከታተያ ሥርዓት',
    username:'የተጠቃሚ ስም', password:'የመግቢያ ቃል', login:'ግባ', logout:'ውጣ',
    install:'መተግበሪያ አውርድ', installManual:'መተግበሪያውን ለመጫን የአሳሹ ምናሌ (⋮) ይክፈቱና «መተግበሪያ ጫን» የሚለውን ይምረጡ።',
    tabStudents:'ተማሪዎች', tabAttendance:'ዕለታዊ መገኘት', tabGrades:'የፈተና ውጤቶች',
    tabReports:'ሪፖርቶች', tabReadings:'ቂራአቶች', tabUsers:'ተጠቃሚዎች',
    addStudent:'ተማሪ ያክሉ', editStudent:'ተማሪ ያስተካክሉ', searchPlaceholder:'ተማሪ ይፈልጉ…',
    noStudents:'እስካሁን ተማሪ አልተመዘገበም።',
    colStudent:'የተማሪ ስም', colFather:'የአባት ስም', colGuardianPhone:'የወላጅ ስልክ', colActions:'ተግባራት',
    save:'አስቀምጥ', cancel:'ተወው', yes:'አዎ', confirm:'ማረጋገጫ',
    present:'ተገኘ', absent:'አልተገኘም', colStatus:'መገኘት / ማለመገኘት',
    colLate:'ዘግይቶ (ደቂቃ)', colBook:'መጽሐፍ', colNotes:'ማስታወሻ',
    bookYes:'አመጣ', bookNo:'ባዶ እጅ',
    addExam:'ፈተና ያክሉ', noExams:'እስካሁን ፈተና አልተመዘገበም።',
    gradesHint:'ጠቅላላ እና መቶኛ በራስ-ሰር ይሰላሉ።',
    examName:'የፈተና ስም', maxScore:'ከፍተኛ ነጥብ', examDate:'የፈተና ቀን', points:'ነጥብ',
    total:'ጠቅላላ', pct:'መቶኛ', average:'አማካይ',
    from:'ከ', to:'እስከ', generate:'ሪፖርት አዘጋጅ',
    noReports:'ቀናትን ይምረጡና «ሪፖርት አዘጋጅ» የሚለውን ይንኩ።',
    addReading:'አዲስ ቂራአት ያክሉ', editReading:'ቂራአት ያስተካክሉ',
    noReadings:'እስካሁን ቂራአት አልተፈጠረም። «አዲስ ቂራአት ያክሉ» የሚለውን ይንኩ።',
    readingName:'የቂራአት ስም', studyDays:'የትምህርት ቀናት',
    dayMon:'ሰኞ', dayTue:'ማክሰኞ', dayWed:'ረቡዕ', dayThu:'ሐሙስ', dayFri:'አርብ', daySat:'ቅዳሜ', daySun:'እሁድ',
    addUser:'ረዳት ተጠቃሚ ያክሉ', role:'ሚና', teacher:'መምህር', assistant:'ረዳት',
    changePassword:'የመግቢያ ቃል ይቀይሩ', oldPassword:'የድሮ ቃል', newPassword:'አዲስ ቃል', repeatPassword:'አዲሱን ድገም',
    assistantNote:'ረዳቱ የተማሪዎችን ስም፣ መገኘት፣ የመጽሐፍ ሁኔታ እና የዘግይት ደቂቃዎችን ብቻ ያያል፤ ውጤቶች እና ሪፖርቶች ተደብቀው ይኖራሉ።',
    sendMessage:'ለወላጅ መልእክት', share:'አጋራ', copy:'ቅዳ',
    footerNote:'መረጃዎ በዚህ መሣሪያ ላይ ብቻ ይቀመጣሉ።',
    edit:'አርትዕ', delete:'ሰርዝ', select:'ይምረጡ', current:'የተመረጠ', studentsLabel:'ተማሪዎች',
    noReading:'ቂራአት አልተመረጠም።', pickDate:'እባክዎ ቀን ይምረጡ።',
    savedOk:'በተሳካ ሁኔታ ተቀምጧል።', copied:'ወደ ቅንጥብ ሰሌዳ ተቀድቷል።', copyFail:'መቅዳቱ አልተሳካም።',
    loginFailed:'የተጠቃሚ ስም ወይም የመግቢያ ቃል አልትክክለም።',
    userExists:'ይህ የተጠቃሚ ስም አስቀድሞ አለ።', fieldsMissing:'እባክዎ ሁሉንም መስኮች ይሙሉ።',
    passMismatch:'አዲሶቹ ቃላት አይመሳሰሉም።', passShort:'የመግቢያ ቃሉ ቢያንስ 4 ፊደላት መሆን አለበት።',
    passWrongOld:'የድሮው ቃል አይክክልም።', passChanged:'የመግቢያ ቃል ተቀይሯል።',
    studentSaved:'የተማሪው መረጃ ተቀምጧል።', studentDeleted:'ተማሪው ተሰርዟል።',
    readingSaved:'ቂራአቱ ተቀምጧል።', readingDeleted:'ቂራአቱ እና ሁሉም መረጃው ተሰርዟል።',
    examSaved:'ፈተናው ተቀምጧል።', examDeleted:'ፈተናው ተሰርዟል።',
    userSaved:'ተጠቃሚው ታክሏል።', userDeleted:'ተጠቃሚው ተሰርዟል።',
    needDays:'ቢያንስ አንድ የትምህርት ቀን ይምረጡ።',
    confirmDelStudent:'ይህን ተማሪ ማጥፋት ይፈልጋሉ? ሁሉም መዝገቡ ይጠፋል።',
    confirmDelReading:'ይህን ቂራአት ማጥፋት ይፈልጋሉ? ተማሪዎቹ፣ መገኘቱ፣ ፈተናዎቹ እና ውጤቶቹ በሙሉ ይጠፋሉ።',
    confirmDelExam:'ይህን ፈተና ማጥፋት ይፈልጋሉ?', confirmDelUser:'ይህን ተጠቃሚ ማጥፋት ይፈልጋሉ?',
    studyDay:'የትምህርት ቀን ነው።', notStudyDay:'የትምህርት ቀን አይደለም።',
    noPhone:'ለወላጁ ስልክ ቁጥር አልተመዘገበም።',
    telegramHint:'መልእክቱ ተቀድቷል፤ ወደ ውይይቱ ገብተው ይለጥፉ።',
    shareFallback:'መጋራት በዚህ መሣሪያ አይደገፍም፤ መልእክቱ ተቀድቷል።',
    rPresent:'ተገኝቷል', rAbsent:'አልተገኘም', rLate:'የዘግይት ደቂቃ', rNoBook:'መጽሐፍ አልመጣም', rExams:'የፈተና ውጤት',
    noEvents:'ምንም ልዩ ክስተት አልተመዘገበም።', moreEvents:'ተጨማሪ', noRecords:'በዚህ ጊዜ ውስጥ መዝገብ አልተገኘም።'
  },
  ar: {
    appTitle:'متابعة القراءات', appSubtitle:'نظام متابعة طلاب القراءات',
    username:'اسم المستخدم', password:'كلمة المرور', login:'دخول', logout:'خروج',
    install:'تثبيت التطبيق', installManual:'لتثبيت التطبيق افتح قائمة المتصفح (⋮) واختر «تثبيت التطبيق».',
    tabStudents:'الطلاب', tabAttendance:'الحضور اليومي', tabGrades:'درجات الاختبارات',
    tabReports:'التقارير', tabReadings:'القراءات', tabUsers:'المستخدمون',
    addStudent:'إضافة طالب', editStudent:'تعديل الطالب', searchPlaceholder:'ابحث عن طالب…',
    noStudents:'لم يُسجَّل أي طالب بعد.',
    colStudent:'اسم الطالب', colFather:'اسم الأب', colGuardianPhone:'جوال ولي الأمر', colActions:'إجراءات',
    save:'حفظ', cancel:'إلغاء', yes:'نعم', confirm:'تأكيد',
    present:'حاضر', absent:'غائب', colStatus:'الحضور / الغياب',
    colLate:'التأخير (دقيقة)', colBook:'الكتاب', colNotes:'ملاحظات',
    bookYes:'أحضره', bookNo:'خالي اليدين',
    addExam:'إضافة اختبار', noExams:'لم يُسجَّل أي اختبار بعد.',
    gradesHint:'يُحسب المجموع والنسبة تلقائيًا.',
    examName:'اسم الاختبار', maxScore:'الدرجة العظمى', examDate:'تاريخ الاختبار', points:'نقطة',
    total:'المجموع', pct:'النسبة', average:'المتوسط',
    from:'من', to:'إلى', generate:'إعداد التقرير',
    noReports:'اختر النطاق الزمني ثم اضغط «إعداد التقرير».',
    addReading:'إضافة قراءة جديدة', editReading:'تعديل القراءة',
    noReadings:'لا توجد قراءات بعد. اضغط «إضافة قراءة جديدة».',
    readingName:'اسم القراءة', studyDays:'أيام الدراسة',
    dayMon:'الاثنين', dayTue:'الثلاثاء', dayWed:'الأربعاء', dayThu:'الخميس', dayFri:'الجمعة', daySat:'السبت', daySun:'الأحد',
    addUser:'إضافة مستخدم مساعد', role:'الدور', teacher:'الأستاذ', assistant:'مساعد',
    changePassword:'تغيير كلمة المرور', oldPassword:'الكلمة القديمة', newPassword:'الكلمة الجديدة', repeatPassword:'أعد الكلمة الجديدة',
    assistantNote:'يرى المساعد أسماء الطلاب والحضور وحالة الكتاب ودقائق التأخير فقط؛ وتُحجب عنه الدرجات والتقارير تمامًا.',
    sendMessage:'رسالة لولي الأمر', share:'مشاركة', copy:'نسخ',
    footerNote:'تُحفظ بياناتك محليًا في هذا الجهاز فقط.',
    edit:'تعديل', delete:'حذف', select:'اختيار', current:'المختارة', studentsLabel:'طالب',
    noReading:'لم تُحدَّد قراءة.', pickDate:'يُرجى اختيار التاريخ.',
    savedOk:'تم الحفظ بنجاح.', copied:'تم نسخ الرسالة.', copyFail:'تعذّر النسخ.',
    loginFailed:'اسم المستخدم أو كلمة المرور غير صحيحة.',
    userExists:'اسم المستخدم موجود مسبقًا.', fieldsMissing:'يُرجى تعبئة جميع الحقول.',
    passMismatch:'الكلمتان الجديدتان غير متطابقتين.', passShort:'كلمة المرور يجب ألا تقل عن 4 أحرف.',
    passWrongOld:'الكلمة القديمة غير صحيحة.', passChanged:'تم تغيير كلمة المرور.',
    studentSaved:'تم حفظ بيانات الطالب.', studentDeleted:'تم حذف الطالب.',
    readingSaved:'تم حفظ القراءة.', readingDeleted:'حُذفت القراءة وكل بياناتها.',
    examSaved:'تم حفظ الاختبار.', examDeleted:'تم حذف الاختبار.',
    userSaved:'تمت إضافة المستخدم.', userDeleted:'تم حذف المستخدم.',
    needDays:'اختر يوم دراسة واحدًا على الأقل.',
    confirmDelStudent:'هل تريد حذف هذا الطالب؟ سيُحذف سجله بالكامل.',
    confirmDelReading:'هل تريد حذف هذه القراءة؟ ستحذف معها الطلاب والحضور والاختبارات والدرجات جميعها.',
    confirmDelExam:'هل تريد حذف هذا الاختبار؟', confirmDelUser:'هل تريد حذف هذا المستخدم؟',
    studyDay:'يوم دراسة.', notStudyDay:'ليس يوم دراسة.',
    noPhone:'لا يوجد رقم جوال لولي الأمر.',
    telegramHint:'نُسخت الرسالة؛ الصقها في المحادثة بعد فتحها.',
    shareFallback:'المشاركة غير مدعومة هنا؛ تم نسخ الرسالة بدلًا منها.',
    rPresent:'حضور', rAbsent:'غياب', rLate:'دقائق تأخير', rNoBook:'بدون كتاب', rExams:'نتيجة الاختبارات',
    noEvents:'لا أحداث مسجلة.', moreEvents:'أخرى', noRecords:'لا سجلات في هذه الفترة.'
  },
  en: {
    appTitle:"Qira'at Tracker", appSubtitle:"Student Qira'at Tracking System",
    username:'Username', password:'Password', login:'Sign in', logout:'Sign out',
    install:'Install App', installManual:'To install, open the browser menu (⋮) and choose "Install app".',
    tabStudents:'Students', tabAttendance:'Daily Attendance', tabGrades:'Exam Grades',
    tabReports:'Reports', tabReadings:'Readings', tabUsers:'Users',
    addStudent:'Add Student', editStudent:'Edit Student', searchPlaceholder:'Search student…',
    noStudents:'No students registered yet.',
    colStudent:'Student Name', colFather:"Father's Name", colGuardianPhone:'Guardian Phone', colActions:'Actions',
    save:'Save', cancel:'Cancel', yes:'Yes', confirm:'Confirm',
    present:'Present', absent:'Absent', colStatus:'Attendance',
    colLate:'Late (min)', colBook:'Book', colNotes:'Note',
    bookYes:'Brought', bookNo:'Empty-handed',
    addExam:'Add Exam', noExams:'No exams registered yet.',
    gradesHint:'Totals and percentages are computed automatically.',
    examName:'Exam Name', maxScore:'Max Score', examDate:'Exam Date', points:'pts',
    total:'Total', pct:'Percent', average:'Average',
    from:'From', to:'To', generate:'Generate Report',
    noReports:'Pick a date range then press "Generate Report".',
    addReading:'Add New Reading', editReading:'Edit Reading',
    noReadings:'No readings yet. Press "Add New Reading".',
    readingName:'Reading Name', studyDays:'Study Days',
    dayMon:'Mon', dayTue:'Tue', dayWed:'Wed', dayThu:'Thu', dayFri:'Fri', daySat:'Sat', daySun:'Sun',
    addUser:'Add Assistant User', role:'Role', teacher:'Teacher', assistant:'Assistant',
    changePassword:'Change Password', oldPassword:'Old password', newPassword:'New password', repeatPassword:'Repeat new password',
    assistantNote:'The assistant sees only student names, attendance, book status and late minutes; grades and reports stay hidden.',
    sendMessage:'Message to Guardian', share:'Share', copy:'Copy',
    footerNote:'Your data is stored locally on this device only.',
    edit:'Edit', delete:'Delete', select:'Select', current:'Current', studentsLabel:'students',
    noReading:'No reading selected.', pickDate:'Please pick a date.',
    savedOk:'Saved successfully.', copied:'Message copied.', copyFail:'Copy failed.',
    loginFailed:'Wrong username or password.',
    userExists:'This username already exists.', fieldsMissing:'Please fill in all fields.',
    passMismatch:'The new passwords do not match.', passShort:'Password must be at least 4 characters.',
    passWrongOld:'The old password is incorrect.', passChanged:'Password changed.',
    studentSaved:'Student data saved.', studentDeleted:'Student deleted.',
    readingSaved:'Reading saved.', readingDeleted:'Reading and all its data deleted.',
    examSaved:'Exam saved.', examDeleted:'Exam deleted.',
    userSaved:'User added.', userDeleted:'User deleted.',
    needDays:'Select at least one study day.',
    confirmDelStudent:'Delete this student? The entire record will be lost.',
    confirmDelReading:'Delete this reading? Its students, attendance, exams and grades will all be deleted.',
    confirmDelExam:'Delete this exam?', confirmDelUser:'Delete this user?',
    studyDay:'It is a study day.', notStudyDay:'Not a study day.',
    noPhone:'No guardian phone number recorded.',
    telegramHint:'Message copied; paste it into the chat after it opens.',
    shareFallback:'Sharing not supported here; message copied instead.',
    rPresent:'Present', rAbsent:'Absent', rLate:'min late', rNoBook:'No book', rExams:'Exam results',
    noEvents:'No notable events.', moreEvents:'more', noRecords:'No records in this period.'
  }
};

const LOCALE = { am:'am-ET', en:'en-GB', ar:'ar' };
const lang = () => DB.settings.lang || 'am';
const t = k => (I18N[lang()] && I18N[lang()][k]) || I18N.am[k] || k;

function fmtDateLong(iso) {
  if (!iso) return '';
  try { return new Date(iso + 'T00:00:00').toLocaleDateString(LOCALE[lang()], { weekday:'long', year:'numeric', month:'long', day:'numeric' }); }
  catch (e) { return iso; }
}
function fmtDateShort(iso) {
  if (!iso) return '';
  try { return new Date(iso + 'T00:00:00').toLocaleDateString(LOCALE[lang()], { day:'numeric', month:'short' }); }
  catch (e) { return iso; }
}
const DAY_KEYS = ['daySun','dayMon','dayTue','dayWed','dayThu','dayFri','daySat'];
const dayName = d => t(DAY_KEYS[+d]);

/* ─────────────── 2) قاعدة البيانات المحلية ─────────────── */
const STORE_KEY = 'qiraat_manager_v2';

function seed() {
  return {
    users: [{ username:'admin', password:'admin123', role:'teacher' }],
    readings: [{ id:'r_' + uid(), name:'የመጀመሪያ ቂራአት', days:[1, 3, 5], createdAt: Date.now() }],
    students: [],
    attendance: {},
    exams: [],
    scores: {},
    settings: { lang:'am', currentReading: null }
  };
}
function loadDB() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    const base = seed();
    return Object.assign(base, data, { settings: Object.assign(base.settings, data.settings || {}) });
  } catch (e) { return null; }
}
let DB = loadDB() || seed();
function save() { localStorage.setItem(STORE_KEY, JSON.stringify(DB)); }
save();

/* ─────────────── 3) الجلسة والمصادقة ─────────────── */
let session = null;
try { session = JSON.parse(sessionStorage.getItem('qiraat_session_v1')) || null; } catch (e) { session = null; }
function setSession(u) {
  session = u ? { username: u.username, role: u.role } : null;
  if (session) sessionStorage.setItem('qiraat_session_v1', JSON.stringify(session));
  else sessionStorage.removeItem('qiraat_session_v1');
}
const isTeacher = () => !!session && session.role === 'teacher';

/* ─────────────── 4) الإشعار والنوافذ ─────────────── */
let toastTimer = null;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}
function openModal(id)  { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }
let confirmCb = null;
function confirmAction(msg, cb) {
  $('#confirmText').textContent = msg;
  confirmCb = cb;
  openModal('modalConfirm');
}

/* ─────────────── 5) استعلامات ─────────────── */
function currentReading() {
  let r = DB.readings.find(x => x.id === DB.settings.currentReading);
  if (!r) r = DB.readings[0] || null;
  if (r) DB.settings.currentReading = r.id;
  return r;
}
const studentsOf = rid => (rid ? DB.students.filter(s => s.readingId === rid) : []);
const examsOf     = rid => (rid ? DB.exams.filter(e => e.readingId === rid).sort((a, b) => (a.date || '') < (b.date || '') ? -1 : 1) : []);

/* ─────────────── 6) تطبيق اللغة ─────────────── */
function applyLang(l) {
  if (!I18N[l]) l = 'am';
  DB.settings.lang = l; save();
  document.documentElement.lang = l;
  document.documentElement.dir = (l === 'ar') ? 'rtl' : 'ltr';
  $$('[data-i18n]').forEach(el => { const v = I18N[l][el.dataset.i18n]; if (v != null) el.textContent = v; });
  $$('[data-i18n-ph]').forEach(el => { const v = I18N[l][el.dataset.i18nPh]; if (v != null) el.placeholder = v; });
  $$('[data-i18n-title]').forEach(el => { const v = I18N[l][el.dataset.i18nTitle]; if (v != null) el.title = v; });
  $('#langSelect').value = l;
  if (session) renderAll();
}

/* ─────────────── 7) الدخول والخروج ─────────────── */
function showLogin() {
  $('#loginScreen').classList.remove('hidden');
  $('#app').classList.add('hidden');
  $('#loginPass').value = '';
  setTimeout(() => $('#loginUser').focus(), 100);
}
function showApp() {
  $('#loginScreen').classList.add('hidden');
  $('#app').classList.remove('hidden');
  document.body.dataset.role = session.role;
  $('#userBadge').innerHTML =
    `<svg class="ic"><use href="#icon-user"/></svg>${esc(session.username)} · ${t(session.role)}`;
  $('#attDate').value = todayISO();
  const to = todayISO();
  $('#reportTo').value = to;
  $('#reportFrom').value = addDaysISO(to, -6);
  renderAll();
}
function logout() {
  setSession(null);
  delete document.body.dataset.role;
  showLogin();
}

/* ─────────────── 8) مبدّل القراءة ─────────────── */
function renderReadingSelect() {
  const sel = $('#readingSelect');
  sel.innerHTML = '';
  if (!DB.readings.length) {
    const o = document.createElement('option');
    o.value = ''; o.textContent = t('noReading');
    sel.appendChild(o); return;
  }
  const cur = currentReading();
  DB.readings.forEach(r => {
    const o = document.createElement('option');
    o.value = r.id;
    o.textContent = `${r.name} (${studentsOf(r.id).length})`;
    if (cur && r.id === cur.id) o.selected = true;
    sel.appendChild(o);
  });
}

/* ─────────────── 9) الطلاب ─────────────── */
function renderStudents() {
  const reading = currentReading();
  const list = studentsOf(reading && reading.id);
  const q = ($('#studentSearch').value || '').trim().toLowerCase();
  const filtered = q ? list.filter(s => (s.name + ' ' + s.father).toLowerCase().includes(q)) : list;

  $('#studentsCount').textContent = list.length;
  const emptyEl = $('#studentsEmpty');
  emptyEl.textContent = reading ? t('noStudents') : t('noReading');
  emptyEl.classList.toggle('hidden', list.length > 0);

  const tb = $('#studentsBody');
  tb.innerHTML = '';
  filtered.forEach((s, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="col-num">${i + 1}</td>
      <td class="student-name">${esc(s.name)}</td>
      <td>${esc(s.father)}</td>
      <td class="phone-cell" data-role="teacher">${esc(s.phone || '—')}</td>
      <td data-role="teacher"><div class="table-actions">
        <button class="btn-icon" data-edit="${s.id}" title="${t('edit')}"><svg class="ic"><use href="#icon-edit"/></svg></button>
        <button class="btn-icon danger" data-del="${s.id}" title="${t('delete')}"><svg class="ic"><use href="#icon-trash"/></svg></button>
      </div></td>`;
    tb.appendChild(tr);
  });
}
function openStudentModal(student) {
  $('#modalStudentTitle').textContent = student ? t('editStudent') : t('addStudent');
  $('#studentEditId').value = student ? student.id : '';
  $('#studentName').value = student ? student.name : '';
  $('#studentFather').value = student ? student.father : '';
  $('#studentPhone').value = student ? student.phone : '';
  openModal('modalStudent');
  setTimeout(() => $('#studentName').focus(), 80);
}
function saveStudent() {
  const name = $('#studentName').value.trim();
  const father = $('#studentFather').value.trim();
  const phone = $('#studentPhone').value.trim();
  if (!name || !father || !phone) { toast(t('fieldsMissing')); return; }
  const reading = currentReading();
  if (!reading) { toast(t('noReading')); return; }
  const editId = $('#studentEditId').value;
  if (editId) {
    const s = DB.students.find(x => x.id === editId);
    if (s) { s.name = name; s.father = father; s.phone = phone; }
  } else {
    DB.students.push({ id: 's_' + uid(), readingId: reading.id, name, father, phone, createdAt: Date.now() });
  }
  save(); closeModal('modalStudent'); renderStudents(); renderAttendance(); renderGrades();
  toast(t('studentSaved'));
}
function deleteStudent(id) {
  confirmAction(t('confirmDelStudent'), () => {
    DB.students = DB.students.filter(s => s.id !== id);
    for (const key in DB.attendance) delete DB.attendance[key][id];
    for (const k in DB.scores) if (k.endsWith('|' + id)) delete DB.scores[k];
    save(); renderStudents(); renderAttendance(); renderGrades();
    toast(t('studentDeleted'));
  });
}

/* ─────────────── 10) الحضور اليومي ─────────────── */
function renderAttendance() {
  const reading = currentReading();
  const list = studentsOf(reading && reading.id);
  const emptyEl = $('#attEmpty');
  emptyEl.textContent = reading ? t('noStudents') : t('noReading');
  emptyEl.classList.toggle('hidden', list.length > 0);

  const date = $('#attDate').value;
  const rec = (reading && date && DB.attendance[`${reading.id}|${date}`]) || {};
  const tb = $('#attendanceBody');
  tb.innerHTML = '';
  list.forEach(s => {
    const r = rec[s.id] || { status:'present', late:0, book:'yes', note:'' };
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="student-name">${esc(s.name)} <span class="student-sub">${esc(s.father)}</span></td>
      <td>
        <div class="status-toggle" data-student="${s.id}">
          <button type="button" class="st-present ${r.status === 'present' ? 'on' : ''}" data-val="present">
            <svg class="ic"><use href="#icon-check"/></svg><span>${t('present')}</span>
          </button>
          <button type="button" class="st-absent ${r.status === 'absent' ? 'on' : ''}" data-val="absent">
            <svg class="ic"><use href="#icon-x"/></svg><span>${t('absent')}</span>
          </button>
        </div>
      </td>
      <td><input type="number" class="late-input" min="0" max="720" step="1"
                 value="${+r.late || 0}" data-late="${s.id}" ${r.status === 'absent' ? 'disabled' : ''}></td>
      <td>
        <div class="book-toggle" data-student="${s.id}">
          <button type="button" class="bk-yes ${r.book === 'yes' ? 'on' : ''}" data-val="yes">${t('bookYes')}</button>
          <button type="button" class="bk-no ${r.book === 'no' ? 'on' : ''}" data-val="no">${t('bookNo')}</button>
        </div>
      </td>
      <td data-role="teacher">
        <input type="text" class="note-input" data-note="${s.id}" value="${esc(r.note || '')}" placeholder="…">
      </td>`;
    tb.appendChild(tr);
  });
  updateAttSums();
  updateDayInfo();
}
function updateAttSums() {
  let p = 0, a = 0;
  $$('#attendanceBody .status-toggle').forEach(tg => {
    if (tg.querySelector('.st-present').classList.contains('on')) p++;
    else a++;
  });
  $('#sumPresent').textContent = p;
  $('#sumAbsent').textContent = a;
}
function updateDayInfo() {
  const el = $('#attDayInfo');
  const reading = currentReading();
  const date = $('#attDate').value;
  if (!reading || !date) { el.textContent = reading ? '' : t('noReading'); return; }
  const wd = new Date(date + 'T00:00:00').getDay();
  const isStudy = reading.days.includes(wd);
  el.textContent = `◈ ${reading.name} — ${fmtDateLong(date)} — ${isStudy ? t('studyDay') : t('notStudyDay')}`;
}
function saveAttendance() {
  const reading = currentReading();
  if (!reading) { toast(t('noReading')); return; }
  const date = $('#attDate').value;
  if (!date) { toast(t('pickDate')); return; }
  const key = `${reading.id}|${date}`;
  DB.attendance[key] = DB.attendance[key] || {};
  $$('#attendanceBody tr').forEach(tr => {
    const wrap = tr.querySelector('.status-toggle');
    if (!wrap) return;
    const sid = wrap.dataset.student;
    const status = wrap.querySelector('.st-present').classList.contains('on') ? 'present' : 'absent';
    const lateInp = tr.querySelector('.late-input');
    const late = status === 'present' ? Math.max(0, parseInt(lateInp.value, 10) || 0) : 0;
    const book = tr.querySelector('.bk-yes').classList.contains('on') ? 'yes' : 'no';
    const noteEl = tr.querySelector('.note-input');
    DB.attendance[key][sid] = { status, late, book, note: noteEl ? noteEl.value.trim() : '' };
  });
  save();
  toast(t('savedOk'));
}

/* ─────────────── 11) الاختبارات والدرجات ─────────────── */
function renderGrades() {
  if (!isTeacher()) return;
  const reading = currentReading();
  const students = studentsOf(reading && reading.id);
  const exams = examsOf(reading && reading.id);

  const chips = $('#examsChips');
  chips.innerHTML = '';
  exams.forEach(ex => {
    const c = document.createElement('span');
    c.className = 'chip';
    c.innerHTML = `${esc(ex.name)} <small>${ex.max} ${t('points')} · ${fmtDateShort(ex.date)}</small>
      <button class="chip-x" data-delexam="${ex.id}" title="${t('delete')}"><svg class="ic"><use href="#icon-x"/></svg></button>`;
    chips.appendChild(c);
  });
  $('#gradesEmpty').classList.toggle('hidden', exams.length > 0);

  let h = `<tr><th class="col-num">#</th><th>${t('colStudent')}</th>`;
  exams.forEach(ex => {
    h += `<th>${esc(ex.name)}<div class="student-sub">${ex.max} ${t('points')} · ${fmtDateShort(ex.date)}</div></th>`;
  });
  h += `<th>${t('total')}</th><th>${t('pct')}</th></tr>`;
  $('#gradesHead').innerHTML = h;

  const tb = $('#gradesBody');
  tb.innerHTML = '';
  students.forEach((s, i) => {
    const tr = document.createElement('tr');
    let cells = `<td class="col-num">${i + 1}</td><td class="student-name">${esc(s.name)}</td>`;
    exams.forEach(ex => {
      const v = DB.scores[`${ex.id}|${s.id}`];
      cells += `<td><input type="number" class="score-input" min="0" max="${ex.max}" step="0.5"
        data-exam="${ex.id}" data-student="${s.id}" value="${v != null ? v : ''}"></td>`;
    });
    cells += `<td class="total-cell td-total">0</td><td class="pct-cell td-pct">0%</td>`;
    tr.innerHTML = cells;
    tb.appendChild(tr);
  });
  recomputeGrades();
}
function recomputeGrades() {
  const exams = examsOf(currentReading() && currentReading().id);
  const maxSum = exams.reduce((s, e) => s + (+e.max || 0), 0);
  $$('#gradesBody tr').forEach(tr => {
    let total = 0;
    exams.forEach(ex => {
      const inp = tr.querySelector(`[data-exam="${ex.id}"]`);
      if (inp && inp.value !== '') total += parseFloat(inp.value) || 0;
    });
    const pct = maxSum ? Math.round((total / maxSum) * 100) : 0;
    tr.querySelector('.td-total').textContent = total;
    const pe = tr.querySelector('.td-pct');
    pe.textContent = pct + '%';
    pe.className = 'pct-cell td-pct ' + (pct >= 80 ? 'pct-high' : pct >= 50 ? 'pct-mid' : 'pct-low');
  });
  let f = `<tr><td colspan="2">${t('average')}</td>`;
  exams.forEach(ex => {
    const vals = [];
    $$('#gradesBody tr').forEach(tr => {
      const inp = tr.querySelector(`[data-exam="${ex.id}"]`);
      if (inp && inp.value !== '') vals.push(parseFloat(inp.value) || 0);
    });
    f += `<td class="total-cell">${vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '—'}</td>`;
  });
  let sumPct = 0, n = 0;
  $$('#gradesBody tr').forEach(tr => {
    const p = parseFloat(tr.querySelector('.td-pct').textContent);
    if (!isNaN(p)) { sumPct += p; n++; }
  });
  f += `<td class="total-cell">—</td><td class="pct-cell">${n ? Math.round(sumPct / n) + '%' : '—'}</td></tr>`;
  $('#gradesFoot').innerHTML = f;
}
function openExamModal() {
  $('#examEditId').value = '';
  $('#examName').value = '';
  $('#examMax').value = 10;
  $('#examDate').value = todayISO();
  openModal('modalExam');
  setTimeout(() => $('#examName').focus(), 80);
}
function saveExam() {
  const reading = currentReading();
  if (!reading) { toast(t('noReading')); return; }
  const name = $('#examName').value.trim();
  const max = parseInt($('#examMax').value, 10);
  const date = $('#examDate').value;
  if (!name || !max || !date) { toast(t('fieldsMissing')); return; }
  DB.exams.push({ id: 'e_' + uid(), readingId: reading.id, name, max, date });
  save(); closeModal('modalExam'); renderGrades();
  toast(t('examSaved'));
}
function deleteExam(id) {
  confirmAction(t('confirmDelExam'), () => {
    DB.exams = DB.exams.filter(e => e.id !== id);
    for (const k in DB.scores) if (k.startsWith(id + '|')) delete DB.scores[k];
    save(); renderGrades();
    toast(t('examDeleted'));
  });
}

/* ─────────────── 12) جمع سجل الطالب ─────────────── */
function collectStudentRecord(sid, from, to) {
  const reading = currentReading();
  const days = [];
  if (reading) {
    for (const key in DB.attendance) {
      const [rid, date] = key.split('|');
      if (rid !== reading.id || date < from || date > to) continue;
      const rec = DB.attendance[key][sid];
      if (rec) days.push({ date, status: rec.status, late: +rec.late || 0, book: rec.book, note: rec.note || '' });
    }
  }
  days.sort((a, b) => (a.date < b.date ? -1 : 1));
  const exams = examsOf(reading && reading.id)
    .filter(ex => ex.date >= from && ex.date <= to)
    .map(ex => {
      const score = DB.scores[`${ex.id}|${sid}`];
      return { name: ex.name, max: +ex.max, score, pct: (score != null && ex.max) ? (score / ex.max) * 100 : null };
    });
  return { days, exams };
}

/* ─────────────── 13) التقارير الأسبوعية ─────────────── */
function generateReports() {
  const from = $('#reportFrom').value;
  const to = $('#reportTo').value;
  if (!from || !to) { toast(t('pickDate')); return; }
  const reading = currentReading();
  const students = studentsOf(reading && reading.id);
  const grid = $('#reportsList');
  grid.innerHTML = '';
  $('#reportsEmpty').classList.toggle('hidden', students.length > 0);
  students.forEach(s => grid.appendChild(buildReportCard(s, from, to)));
}
function buildReportCard(s, from, to) {
  const rec = collectStudentRecord(s.id, from, to);
  const days = rec.days;
  const present = days.filter(d => d.status === 'present').length;
  const absents = days.filter(d => d.status === 'absent');
  const lates = days.filter(d => d.status === 'present' && d.late > 0);
  const lateTotal = lates.reduce((a, d) => a + d.late, 0);
  const noBooks = days.filter(d => d.book === 'no');

  const maxSum = rec.exams.reduce((a, e) => a + e.max, 0);
  const scoreSum = rec.exams.reduce((a, e) => a + (e.score != null ? e.score : 0), 0);
  const pct = maxSum ? Math.round((scoreSum / maxSum) * 100) : null;

  const evs = [];
  days.forEach(d => {
    if (d.status === 'absent') {
      evs.push(`<li><svg class="ic ev-absent"><use href="#icon-x"/></svg><span class="ev-absent">${fmtDateShort(d.date)}</span> — ${t('rAbsent')}</li>`);
    } else {
      if (d.late > 0) evs.push(`<li><svg class="ic ev-late"><use href="#icon-clock"/></svg><span class="ev-late">${fmtDateShort(d.date)}</span> — ${t('rLate')} ${d.late}</li>`);
      if (d.book === 'no') evs.push(`<li><svg class="ic ev-book"><use href="#icon-book-open"/></svg><span class="ev-book">${fmtDateShort(d.date)}</span> — ${t('rNoBook')}</li>`);
    }
    if (d.note) evs.push(`<li><svg class="ic"><use href="#icon-file-text"/></svg><span>${fmtDateShort(d.date)}</span> — «${esc(d.note)}»</li>`);
  });
  const evsHtml = evs.length
    ? `<ul>${evs.slice(0, 8).join('')}${evs.length > 8 ? `<li class="no-events">+ ${evs.length - 8} ${t('moreEvents')}…</li>` : ''}</ul>`
    : `<span class="no-events">${t('noEvents')}</span>`;

  const card = document.createElement('div');
  card.className = 'report-card';
  card.innerHTML = `
    <div class="rc-head">
      <div>
        <h4>${esc(s.name)}</h4>
        <div class="rc-sub">${esc(s.father)} · ${fmtDateShort(from)} ← ${fmtDateShort(to)}</div>
      </div>
      <div class="rc-score"><b>${pct != null ? pct + '%' : '—'}</b><small>${t('rExams')}</small></div>
    </div>
    <div class="rc-stats">
      <div class="stat-box"><b>${present}/${days.length}</b><small>${t('rPresent')}</small></div>
      <div class="stat-box ${absents.length ? 'warn' : ''}"><b>${absents.length}</b><small>${t('rAbsent')}</small></div>
      <div class="stat-box ${lateTotal ? 'gold' : ''}"><b>${lateTotal}</b><small>${t('rLate')}</small></div>
      <div class="stat-box ${noBooks.length ? 'warn' : ''}"><b>${noBooks.length}</b><small>${t('rNoBook')}</small></div>
    </div>
    <div class="rc-events">${evsHtml}</div>
    <div class="rc-actions">
      <button class="btn btn-telegram" data-act="msg" data-idx="tg" data-id="${s.id}">
        <svg class="ic"><use href="#icon-telegram"/></svg> Telegram</button>
      <button class="btn btn-sms" data-act="msg" data-idx="sms" data-id="${s.id}">
        <svg class="ic"><use href="#icon-sms"/></svg> SMS</button>
      <button class="btn btn-outline" data-act="msg" data-idx="share" data-id="${s.id}">
        <svg class="ic"><use href="#icon-share"/></svg> ${t('share')}</button>
    </div>`;
  return card;
}

/* ─────────────── 14) الرسالة الأمهرية الفصيحة لولي الأمر ─────────────── */
let msgStudent = null;

function amDate(iso) {
  try { return new Date(iso + 'T00:00:00').toLocaleDateString('am-ET', { weekday:'long', day:'numeric', month:'long' }); }
  catch (e) { return iso; }
}
function amNum(n) { try { return Number(n).toLocaleString('am-ET'); } catch (e) { return String(n); } }

function buildParentMessage(st, fromISO, toISO, readingName) {
  const rec = collectStudentRecord(st.id, fromISO, toISO);
  const days = rec.days;
  const total = days.length;
  const absents = days.filter(d => d.status === 'absent');
  const lates = days.filter(d => d.status === 'present' && d.late > 0);
  const lateTotal = lates.reduce((a, d) => a + d.late, 0);
  const noBooks = days.filter(d => d.book === 'no');
  const present = total - absents.length;

  const L = [];
  L.push('ሰላም ይገባዎ፤');
  L.push('');
  L.push('የልጅዎን የሳምንት የቂራአት መከታተያ ሪፖርት ለማሳየት ተወስነናል።');
  L.push('');
  L.push(`የሳምንቱ ጊዜ፡ ${amDate(fromISO)} እስከ ${amDate(toISO)}`);
  L.push(`ተማሪ፡ ${st.name} ${st.father}`);
  L.push(`ቂራአት፡ ${readingName}`);
  L.push('');

  if (total === 0) {
    L.push('በዚህ ጊዜ የተመዘገበ የትምህርት ቀን የለም።');
  } else {
    L.push(`• መገኘት፡ ከ${amNum(total)} ቀናት ${amNum(present)} ቀን ተገኝቷል${absents.length ? `፤ የጠፉት ቀናት፡ ${absents.map(d => amDate(d.date)).join('፣ ')}` : ''}።`);
    L.push(`• ዘግይቶ መምጣት፡ ${lates.length ? `${amNum(lateTotal)} ደቂቃ ዘግይቷል${lates.length ? `፤ የዘግየት ቀናት፡ ${lates.map(d => amDate(d.date)).join('፣ ')}` : ''}።` : 'አልዘገየም።'}`);
    L.push(`• መጽሐፍ፡ ${noBooks.length ? `በነዚህ ቀናት አልመጣም፡ ${noBooks.map(d => amDate(d.date)).join('፣ ')}።` : 'መጽሐፉን በየቀኑ አምጥቷል።'}`);
    if (rec.exams.length) {
      const ex = rec.exams.map(x => `${x.name}፡ ${amNum(x.score != null ? x.score : 0)} ከ${amNum(x.max)}`).join('፣ ');
      L.push(`• የፈተና ውጤት፡ ${ex}።`);
    }
  }

  L.push('');
  L.push('ለልጅዎ የትምህርት ስኬት እንመኛለን፤ ለትኩረታችሁና ለትብትናችሁም እናመሰግናለን።');
  L.push('');
  L.push('የቂራአት መምህር');
  return L.join('\n');
}

function openMessageModal(student, idx) {
  const reading = currentReading();
  const from = $('#reportFrom').value;
  const to = $('#reportTo').value;
  const text = buildParentMessage(student, from, to, reading ? reading.name : '—');
  msgStudent = student;
  $('#msgStudentName').textContent = `${student.name} ${student.father}`;
  $('#msgPhone').textContent = student.phone || '—';
  $('#messageText').value = text;
  openModal('modalMessage');
}

/* تطبيع رقم الجوال (افتراضي: إثيوبيا +251) */
function normalizePhone(p) {
  let d = String(p || '').replace(/[^\d+]/g, '');
  if (d.startsWith('+')) return d;
  if (d.startsWith('00')) return '+' + d.slice(2);
  if (d.startsWith('0')) return '+251' + d.slice(1);
  return d ? '+' + d : '';
}
function copyText(text) {
  return new Promise(res => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => res(true)).catch(() => res(fallbackCopy(text)));
    } else res(fallbackCopy(text));
  });
}
function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
  document.body.removeChild(ta);
  return ok;
}

/* ─────────────── 15) إدارة القراءات ─────────────── */
function renderReadingsGrid() {
  if (!isTeacher()) return;
  const grid = $('#readingsGrid');
  grid.innerHTML = '';
  $('#readingsEmpty').classList.toggle('hidden', DB.readings.length > 0);
  const cur = currentReading();
  DB.readings.forEach(r => {
    const isCur = cur && r.id === cur.id;
    const card = document.createElement('div');
    card.className = 'reading-card';
    card.innerHTML = `
      <h3><svg class="ic"><use href="#icon-book-open"/></svg>${esc(r.name)}</h3>
      <div class="rc-meta"><svg class="ic"><use href="#icon-users"/></svg>${studentsOf(r.id).length} ${t('studentsLabel')}
        ${isCur ? ` · <b>${t('current')}</b>` : ''}</div>
      <div class="reading-days">${r.days.slice().sort().map(d => `<span class="day-tag">${dayName(d)}</span>`).join('')}</div>
      <div class="rc-btns">
        ${isCur ? '' : `<button class="btn btn-outline btn-sm" data-selread="${r.id}">${t('select')}</button>`}
        <button class="btn btn-ghost btn-sm" data-editread="${r.id}"><svg class="ic"><use href="#icon-edit"/></svg>${t('edit')}</button>
        <button class="btn btn-danger btn-sm" data-delread="${r.id}"><svg class="ic"><use href="#icon-trash"/></svg>${t('delete')}</button>
      </div>`;
    grid.appendChild(card);
  });
}
function openReadingModal(reading) {
  $('#modalReadingTitle').textContent = reading ? t('editReading') : t('addReading');
  $('#readingEditId').value = reading ? reading.id : '';
  $('#readingName').value = reading ? reading.name : '';
  $$('#daysGrid input[type="checkbox"]').forEach(ch => {
    ch.checked = reading ? reading.days.includes(+ch.value) : false;
  });
  openModal('modalReading');
  setTimeout(() => $('#readingName').focus(), 80);
}
function saveReading() {
  const name = $('#readingName').value.trim();
  const days = [...$$('#daysGrid input[type="checkbox"]:checked')].map(c => +c.value);
  if (!name) { toast(t('fieldsMissing')); return; }
  if (!days.length) { toast(t('needDays')); return; }
  const editId = $('#readingEditId').value;
  if (editId) {
    const r = DB.readings.find(x => x.id === editId);
    if (r) { r.name = name; r.days = days; }
  } else {
    const nr = { id: 'r_' + uid(), name, days, createdAt: Date.now() };
    DB.readings.push(nr);
    DB.settings.currentReading = nr.id;
  }
  save(); closeModal('modalReading'); renderAll();
  toast(t('readingSaved'));
}
function deleteReading(id) {
  confirmAction(t('confirmDelReading'), () => {
    const exIds = DB.exams.filter(e => e.readingId === id).map(e => e.id);
    DB.readings = DB.readings.filter(r => r.id !== id);
    DB.students = DB.students.filter(s => s.readingId !== id);
    for (const key in DB.attendance) if (key.startsWith(id + '|')) delete DB.attendance[key];
    DB.exams = DB.exams.filter(e => e.readingId !== id);
    for (const k in DB.scores) if (exIds.some(eid => k.startsWith(eid + '|'))) delete DB.scores[k];
    if (DB.settings.currentReading === id) DB.settings.currentReading = DB.readings[0] ? DB.readings[0].id : null;
    save(); renderAll();
    toast(t('readingDeleted'));
  });
}

/* ─────────────── 16) المستخدمون والصلاحيات ─────────────── */
function renderUsers() {
  if (!isTeacher()) return;
  const tb = $('#usersBody');
  tb.innerHTML = '';
  DB.users.forEach(u => {
    const tr = document.createElement('tr');
    const badge = u.role === 'teacher'
      ? `<span class="role-badge role-teacher">${t('teacher')}</span>`
      : `<span class="role-badge role-assistant">${t('assistant')}</span>`;
    tr.innerHTML = `
      <td class="student-name">${esc(u.username)}</td>
      <td>${badge}</td>
      <td>${u.role === 'assistant'
        ? `<button class="btn-icon danger" data-deluser="${esc(u.username)}" title="${t('delete')}"><svg class="ic"><use href="#icon-trash"/></svg></button>`
        : '—'}</td>`;
    tb.appendChild(tr);
  });
}
function saveNewUser() {
  const name = $('#newUserName').value.trim();
  const pass = $('#newUserPass').value;
  if (!name || !pass) { toast(t('fieldsMissing')); return; }
  if (DB.users.some(u => u.username === name)) { toast(t('userExists')); return; }
  if (pass.length < 4) { toast(t('passShort')); return; }
  DB.users.push({ username: name, password: pass, role: 'assistant' });
  save(); closeModal('modalUser');
  $('#newUserName').value = ''; $('#newUserPass').value = '';
  renderUsers();
  toast(t('userSaved'));
}
function changePassword() {
  const oldP = $('#oldPass').value;
  const newP = $('#newPass').value;
  const newP2 = $('#newPass2').value;
  const me = DB.users.find(u => u.username === session.username);
  if (!me) return;
  if (oldP !== me.password) { toast(t('passWrongOld')); return; }
  if (!newP || newP.length < 4) { toast(t('passShort')); return; }
  if (newP !== newP2) { toast(t('passMismatch')); return; }
  me.password = newP;
  save();
  $('#oldPass').value = $('#newPass').value = $('#newPass2').value = '';
  toast(t('passChanged'));
}

/* ─────────────── 17) العرض الشامل ─────────────── */
function renderAll() {
  currentReading();
  renderReadingSelect();
  renderStudents();
  renderAttendance();
  renderGrades();
  renderReadingsGrid();
  renderUsers();
}

/* ─────────────── 18) ربط الأحداث ─────────────── */
function bindEvents() {
  $('#loginForm').addEventListener('submit', e => {
    e.preventDefault();
    const u = $('#loginUser').value.trim();
    const p = $('#loginPass').value;
    const found = DB.users.find(x => x.username === u && x.password === p);
    if (!found) { $('#loginError').textContent = t('loginFailed'); return; }
    $('#loginError').textContent = '';
    setSession(found);
    showApp();
  });
  $('#btnLogout').addEventListener('click', logout);
  $('#langSelect').addEventListener('change', e => applyLang(e.target.value));
  $('#readingSelect').addEventListener('change', e => {
    DB.settings.currentReading = e.target.value || null;
    save(); renderAll();
  });
  $('#mainTabs').addEventListener('click', e => {
    const btn = e.target.closest('.tab');
    if (!btn) return;
    $$('#mainTabs .tab').forEach(b => b.classList.toggle('active', b === btn));
    const v = btn.dataset.view;
    $$('.view').forEach(s => s.classList.toggle('active', s.id === 'view-' + v));
    if (v === 'reports') generateReports();
  });

  $('#btnAddStudent').addEventListener('click', () => openStudentModal(null));
  $('#btnSaveStudent').addEventListener('click', saveStudent);
  $('#studentSearch').addEventListener('input', renderStudents);
  $('#studentsBody').addEventListener('click', e => {
    const ed = e.target.closest('[data-edit]');
    if (ed) { openStudentModal(DB.students.find(s => s.id === ed.dataset.edit)); return; }
    const dl = e.target.closest('[data-del]');
    if (dl) deleteStudent(dl.dataset.del);
  });

  $('#attDate').addEventListener('change', renderAttendance);
  $('#btnSaveAttendance').addEventListener('click', saveAttendance);
  $('#attendanceBody').addEventListener('click', e => {
    const btn = e.target.closest('.status-toggle button, .book-toggle button');
    if (!btn) return;
    const wrap = btn.parentElement;
    wrap.querySelectorAll('button').forEach(b => b.classList.remove('on'));
    btn.classList.add('on');
    const late = wrap.closest('tr') && wrap.closest('tr').querySelector('.late-input');
    if (late) {
      if (btn.classList.contains('st-absent')) { late.disabled = true; late.value = 0; }
      else if (btn.classList.contains('st-present')) late.disabled = false;
    }
    updateAttSums();
  });

  $('#btnAddExam').addEventListener('click', openExamModal);
  $('#btnSaveExam').addEventListener('click', saveExam);
  $('#examsChips').addEventListener('click', e => {
    const x = e.target.closest('[data-delexam]');
    if (x) deleteExam(x.dataset.delexam);
  });
  $('#gradesBody').addEventListener('input', e => {
    const inp = e.target.closest('.score-input');
    if (!inp) return;
    const ex = DB.exams.find(x => x.id === inp.dataset.exam);
    if (!ex) return;
    const key = `${inp.dataset.exam}|${inp.dataset.student}`;
    if (inp.value === '') { delete DB.scores[key]; }
    else {
      let n = parseFloat(inp.value);
      if (isNaN(n) || n < 0) n = 0;
      if (n > ex.max) { n = ex.max; inp.value = n; }
      DB.scores[key] = n;
    }
    save();
    recomputeGrades();
  });

  $('#btnGenReport').addEventListener('click', generateReports);
  $('#reportsList').addEventListener('click', e => {
    const btn = e.target.closest('[data-act="msg"]');
    if (!btn) return;
    const st = DB.students.find(s => s.id === btn.dataset.id);
    if (!st) return;
    openMessageModal(st, btn.dataset.idx);
  });

  $('#btnSendTelegram').addEventListener('click', () => {
    if (!msgStudent) return;
    const phone = normalizePhone(msgStudent.phone);
    if (!phone) { toast(t('noPhone')); return; }
    copyText($('#messageText').value).then(() => toast(t('telegramHint')));
    window.open('https://t.me/' + phone, '_blank');
  });
  $('#btnSendSms').addEventListener('click', () => {
    if (!msgStudent) return;
    const phone = normalizePhone(msgStudent.phone);
    if (!phone) { toast(t('noPhone')); return; }
    const body = encodeURIComponent($('#messageText').value);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    window.location.href = `sms:${phone}${isIOS ? '&' : '?'}body=${body}`;
  });
  $('#btnShareMsg').addEventListener('click', async () => {
    const text = $('#messageText').value;
    if (navigator.share) {
      try { await navigator.share({ title: t('appTitle'), text }); } catch (e) {}
    } else {
      copyText(text).then(() => toast(t('shareFallback')));
    }
  });
  $('#btnCopyMsg').addEventListener('click', () => {
    copyText($('#messageText').value).then(ok => toast(ok ? t('copied') : t('copyFail')));
  });

  $('#btnAddReading').addEventListener('click', () => openReadingModal(null));
  $('#btnSaveReading').addEventListener('click', saveReading);
  $('#readingsGrid').addEventListener('click', e => {
    const sel = e.target.closest('[data-selread]');
    if (sel) { DB.settings.currentReading = sel.dataset.selread; save(); renderAll(); return; }
    const ed = e.target.closest('[data-editread]');
    if (ed) { openReadingModal(DB.readings.find(r => r.id === ed.dataset.editread)); return; }
    const dl = e.target.closest('[data-delread]');
    if (dl) deleteReading(dl.dataset.delread);
  });

  $('#btnAddUser').addEventListener('click', () => {
    $('#newUserName').value = ''; $('#newUserPass').value = '';
    openModal('modalUser');
    setTimeout(() => $('#newUserName').focus(), 80);
  });
  $('#btnSaveUser').addEventListener('click', saveNewUser);
  $('#usersBody').addEventListener('click', e => {
    const dl = e.target.closest('[data-deluser]');
    if (!dl) return;
    confirmAction(t('confirmDelUser'), () => {
      DB.users = DB.users.filter(u => u.username !== dl.dataset.deluser);
      save(); renderUsers();
      toast(t('userDeleted'));
    });
  });
  $('#btnChangePass').addEventListener('click', changePassword);

  $$('[data-close]').forEach(b => b.addEventListener('click', () => closeModal(b.dataset.close)));
  $$('.modal-overlay').forEach(ov =>
    ov.addEventListener('click', e => { if (e.target === ov) ov.classList.add('hidden'); }));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') $$('.modal-overlay:not(.hidden)').forEach(ov => ov.classList.add('hidden'));
  });
  $('#btnConfirmYes').addEventListener('click', () => {
    closeModal('modalConfirm');
    if (confirmCb) { const cb = confirmCb; confirmCb = null; cb(); }
  });
}

/* ═══════════════════════════════════════════════════════════════
   19) PWA — توليد أيقونات PNG حقيقية وحقن manifest ديناميكي
       (السبب: Chrome لا يقبل أيقونات SVG داخل manifest للتثبيت،
        لذا نولّد PNG برمجياً عبر Canvas ليعمل زر التثبيت فعلياً)
═══════════════════════════════════════════════════════════════ */

function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function drawStar4(ctx, cx, cy, r) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx + r * 0.28, cy - r * 0.28);
  ctx.lineTo(cx + r, cy);
  ctx.lineTo(cx + r * 0.28, cy + r * 0.28);
  ctx.lineTo(cx, cy + r);
  ctx.lineTo(cx - r * 0.28, cy + r * 0.28);
  ctx.lineTo(cx - r, cy);
  ctx.lineTo(cx - r * 0.28, cy - r * 0.28);
  ctx.closePath();
  ctx.fill();
}
function drawBook(ctx, s, o) {
  o = o || {};
  const u = s / 512;
  const cx = 256 * u;
  const w = (o.w || 300) * u;
  const h = (o.h || 280) * u;
  const topY = (o.top != null ? o.top : 180) * u;

  ctx.strokeStyle = '#f0d98c';
  ctx.lineWidth = 18 * u;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(cx - w/2, topY);
  ctx.lineTo(cx, topY + 20*u);
  ctx.lineTo(cx, topY + h);
  ctx.lineTo(cx - w/2, topY + h - 20*u);
  ctx.closePath();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx + w/2, topY);
  ctx.lineTo(cx, topY + 20*u);
  ctx.lineTo(cx, topY + h);
  ctx.lineTo(cx + w/2, topY + h - 20*u);
  ctx.closePath();
  ctx.stroke();

  ctx.lineWidth = 6 * u;
  ctx.beginPath();
  ctx.moveTo(cx - w/2 + 40*u, topY + 70*u);  ctx.lineTo(cx - 30*u, topY + 90*u);
  ctx.moveTo(cx - w/2 + 40*u, topY + 110*u); ctx.lineTo(cx - 30*u, topY + 130*u);
  ctx.moveTo(cx - w/2 + 40*u, topY + 150*u); ctx.lineTo(cx - 30*u, topY + 170*u);
  ctx.moveTo(cx + 30*u, topY + 90*u);  ctx.lineTo(cx + w/2 - 40*u, topY + 70*u);
  ctx.moveTo(cx + 30*u, topY + 130*u); ctx.lineTo(cx + w/2 - 40*u, topY + 110*u);
  ctx.moveTo(cx + 30*u, topY + 170*u); ctx.lineTo(cx + w/2 - 40*u, topY + 150*u);
  ctx.stroke();
}
function drawAppIcon(ctx, s, maskable) {
  const u = s / 512;
  ctx.clearRect(0, 0, s, s);

  const g = ctx.createLinearGradient(0, 0, s, s);
  g.addColorStop(0, '#175641');
  g.addColorStop(0.55, '#0e3b2a');
  g.addColorStop(1, '#07271b');

  if (maskable) {
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
    drawBook(ctx, s, { top: 136, w: 240, h: 240 });
  } else {
    roundRectPath(ctx, 0, 0, s, s, 110 * u);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = 'rgba(212,175,55,.55)';
    ctx.lineWidth = 4 * u;
    roundRectPath(ctx, 22*u, 22*u, 468*u, 468*u, 92*u);
    ctx.stroke();
    ctx.fillStyle = '#d4af37';
    drawStar4(ctx, 256*u, 116*u, 34*u);
    drawBook(ctx, s, { top: 180, w: 300, h: 280 });
  }
}

function setupDynamicManifest() {
  try {
    const icons = [];
    [192, 512].forEach(s => {
      const c = document.createElement('canvas');
      c.width = s; c.height = s;
      drawAppIcon(c.getContext('2d'), s, false);
      icons.push({ src: c.toDataURL('image/png'), sizes: s + 'x' + s, type: 'image/png', purpose: 'any' });
    });
    const cm = document.createElement('canvas');
    cm.width = 512; cm.height = 512;
    drawAppIcon(cm.getContext('2d'), 512, true);
    icons.push({ src: cm.toDataURL('image/png'), sizes: '512x512', type: 'image/png', purpose: 'maskable' });

    const manifest = {
      id: 'qiraat-tracker',
      name: 'የቂራአት መከታተያ',
      short_name: 'ቂራአት መከታተያ',
      description: 'የተማሪዎች የቂራአት መከታተያ ሥርዓት',
      start_url: './index.html',
      scope: './',
      display: 'standalone',
      orientation: 'any',
      dir: 'auto',
      lang: 'am',
      theme_color: '#0e3b2a',
      background_color: '#fbf8ef',
      categories: ['education', 'productivity'],
      icons: icons
    };
    const blob = new Blob([JSON.stringify(manifest)], { type: 'application/manifest+json' });
    const url = URL.createObjectURL(blob);
    let link = document.querySelector('link[rel="manifest"]');
    if (!link) { link = document.createElement('link'); link.rel = 'manifest'; document.head.appendChild(link); }
    link.href = url;
  } catch (e) { /* fallback إلى manifest.json الثابت */ }
}

/* التقاط حدث التثبيت مبكراً (قبل DOMContentLoaded إن أمكن) */
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  const btn = document.getElementById('btnInstall');
  if (btn) btn.classList.remove('hidden');
});
window.addEventListener('appinstalled', () => {
  deferredPrompt = null;
  const btn = document.getElementById('btnInstall');
  if (btn) btn.classList.add('hidden');
});

function setupInstallButton() {
  $('#btnInstall').addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      try { await deferredPrompt.userChoice; } catch (e) {}
      deferredPrompt = null;
      $('#btnInstall').classList.add('hidden');
    } else {
      /* لا يوجد موجه متاح — وجّه المستخدم لقائمة المتصفح */
      toast(t('installManual'));
    }
  });
}
function registerSW() {
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}

/* ─────────────── 20) الإقلاع ─────────────── */
/* حقن manifest ديناميكي بأيقونات PNG في أقرب وقت */
setupDynamicManifest();

document.addEventListener('DOMContentLoaded', () => {
  const actTh = document.querySelector('#studentsTable thead th:last-child');
  if (actTh) actTh.setAttribute('data-role', 'teacher');

  bindEvents();
  setupInstallButton();
  applyLang(DB.settings.lang || 'am');
  registerSW();

  if (session && DB.users.some(u => u.username === session.username)) showApp();
  else showLogin();
});
