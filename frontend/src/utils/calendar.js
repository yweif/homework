// 简单农历数据（2026年示例）
const lunarDayNames = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];

const lunarMonthNames = ['正月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '冬月', '腊月'];

// 中国法定节假日
const holidays = {
  '01-01': '元旦',
  '02-14': '情人节',
  '03-08': '妇女节',
  '03-12': '植树节',
  '04-01': '愚人节',
  '05-01': '劳动节',
  '05-04': '青年节',
  '06-01': '儿童节',
  '07-01': '建党节',
  '08-01': '建军节',
  '09-10': '教师节',
  '10-01': '国庆节',
  '10-31': '万圣节',
  '12-25': '圣诞节'
};

// 简单农历计算（仅用于显示，不精确）
export function getLunarDate(date) {
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  const lunarDay = lunarDayNames[dayOfYear % 30];
  const lunarMonth = lunarMonthNames[date.getMonth() % 12];
  return {
    lunarDay: lunarDay || '初一',
    lunarMonth: lunarMonth || '正月',
    isLeap: false
  };
}

// 获取节假日名称
export function getHoliday(date) {
  const key = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  return holidays[key] || null;
}

// 获取某月的日历数据
export function getMonthCalendar(year, month) {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const daysInMonth = lastDay.getDate();
  const startDay = firstDay.getDay();

  const calendar = [];

  // 上个月的填充
  const prevMonthLastDay = new Date(year, month - 1, 0).getDate();
  for (let i = startDay - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    const date = new Date(year, month - 2, day);
    calendar.push({
      day,
      date,
      isCurrentMonth: false,
      isToday: false,
      lunar: getLunarDate(date),
      holiday: getHoliday(date)
    });
  }

  // 当月
  const today = new Date();
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    calendar.push({
      day,
      date,
      isCurrentMonth: true,
      isToday: date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate(),
      lunar: getLunarDate(date),
      holiday: getHoliday(date)
    });
  }

  // 下个月的填充
  const remaining = 42 - calendar.length;
  for (let day = 1; day <= remaining; day++) {
    const date = new Date(year, month, day);
    calendar.push({
      day,
      date,
      isCurrentMonth: false,
      isToday: false,
      lunar: getLunarDate(date),
      holiday: getHoliday(date)
    });
  }

  return calendar;
}

export function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
