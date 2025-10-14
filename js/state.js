// refactored/js/state.js

// 애플리케이션의 모든 동적 상태를 관리합니다.
const state = {
  studentName: '',
  courseKey: null,
  duration: 0,
  startDate: null,
  discount: 0,
  courseType: null, // for SAT, TOEFL, etc.
  drwLevel: null, // for DRW
  
  // 녹화 강의 관련
  isRecordingEnabled: false,
  selectedRecordingDates: [],

  // AP 과목 관련
  isAPMode: false,
  selectedAPCourses: [], // { id, key, name, duration, session, timeSlot, recordingDates: [] }
};

// --- State-modifying functions ---

function updateState(newState) {
  Object.assign(state, newState);
}

function addAPCourse(courseVal, courseLabel) {
  if (state.selectedAPCourses.some(c => c.key === courseVal)) {
    return { needsToast: true, message: '이미 선택된 과목입니다.' };
  }

  const newId = Date.now();
  const cInfo = courseInfo[courseVal];

  const newCourse = {
    id: newId,
    key: courseVal,
    name: courseLabel,
    duration: cInfo.min,
    session: '1',
    timeSlot: '1차',
    recordingDates: []
  };
  state.selectedAPCourses.push(newCourse);
  return { needsToast: false, newCourse };
}

function removeAPCourse(id) {
  state.selectedAPCourses = state.selectedAPCourses.filter(c => c.id !== id);
  if (state.selectedAPCourses.length === 0) {
    updateState({ isAPMode: false, courseKey: null });
  }
}

function updateAPCourse(id, newProps) {
  const course = state.selectedAPCourses.find(c => c.id === id);
  if (course) {
    Object.assign(course, newProps);
  }
  return course;
}

function toggleRecordingDate(date) {
  const idx = state.selectedRecordingDates.indexOf(date);
  if (idx > -1) {
    state.selectedRecordingDates.splice(idx, 1);
  } else {
    state.selectedRecordingDates.push(date);
  }
  state.selectedRecordingDates.sort();
}

function toggleAPRecordingDate(courseId, date) {
  const course = state.selectedAPCourses.find(c => c.id === courseId);
  if (!course) return;

  const idx = course.recordingDates.indexOf(date);
  if (idx > -1) {
    course.recordingDates.splice(idx, 1);
  } else {
    course.recordingDates.push(date);
  }
  course.recordingDates.sort();
}

function resetRecordingDates() {
  state.selectedRecordingDates = [];
}

function resetAPRecordingDates(courseId) {
    const course = state.selectedAPCourses.find(c => c.id === courseId);
    if (course) {
        course.recordingDates = [];
    }
}

function resetAllAPCourses() {
    state.selectedAPCourses = [];
}
