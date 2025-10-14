// calculator_UI_UX.js - 전체 수정본

// 패치 모달
$('#patchBtn').on('click', function(){
  $('#patchModal').fadeIn(120);
});
$('#closePatchModal, #patchModal').on('click', function(e){
  if (e.target === this) $('#patchModal').fadeOut(100);
});

// 링크 버튼
$('#linkBtn').on('click', function(){
  const url = $(this).data('href');
  if (url) {
    window.location.href = url;
  }
});

let enabledDays = null;
let selectedAPCourses = [];
let selectedRecordingDates = [];

// ✅ 녹화강의 토글 이벤트
$('#recordingToggle').on('change', function() {
  if ($(this).is(':checked')) {
    $('#recordingCalendarSection').show();
    initRecordingCalendar();
  } else {
    $('#recordingCalendarSection').hide();
    selectedRecordingDates = [];
    $('#selectedRecordingDates').text('');
  }
});

// ✅ 수정된 녹화강의 달력 초기화 (하이라이트 정확화)
function initRecordingCalendar() {
  const startDateStr = $('#startDate').val();
  const duration = parseInt($('#duration').val()) || 0;
  
  if (!startDateStr || !duration) {
    showToast('수강 시작일과 기간을 먼저 선택하세요.');
    $('#recordingToggle').prop('checked', false);
    $('#recordingCalendarSection').hide();
    return;
  }
  
  const startDate = new Date(startDateStr);
  const courseKey = $('#course').val();
  const cInfo = courseInfo[courseKey];
  
  let selectableDates = [];
  
  // 수강 기간 내의 모든 평일(월~금)을 선택 가능하게 설정
  let currentDate = new Date(startDate);
  let endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + (duration * 7) - 1);
  
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    // 0=일, 1=월, 2=화, 3=수, 4=목, 5=금, 6=토
    // 평일(1~5)만 선택 가능
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      const dateStr = currentDate.toISOString().split('T')[0];
      selectableDates.push(dateStr);
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  $('#recordingCalendar').datepicker('destroy');
  $('#recordingCalendar').datepicker({
    dateFormat: "yy-mm-dd",
    minDate: new Date(2025, 11, 1),
    maxDate: new Date(2026, 0, 31),
    beforeShowDay: function(date) {
      // 시간대 문제 해결: 로컬 시간 기준으로 날짜 계산
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      const isSelectable = selectableDates.includes(dateStr);
      const isSelected = selectedRecordingDates.includes(dateStr);
      
      if (isSelected) {
        return [true, 'ui-state-highlight', ''];
      }
      if (!isSelectable) {
        return [false, 'ui-state-disabled', ''];
      }
      return [true, '', ''];
    },
    onSelect: function(dateText) {
      const idx = selectedRecordingDates.indexOf(dateText);
      if (idx > -1) {
        selectedRecordingDates.splice(idx, 1);
      } else {
        selectedRecordingDates.push(dateText);
      }
      selectedRecordingDates.sort();
      updateRecordingDatesDisplay();
      $('#recordingCalendar').datepicker('refresh');
    }
  });
  
  updateRecordingDatesDisplay();
}

// ✅ 녹화 날짜 토글 (더 이상 필요 없음 - onSelect에 통합)
function toggleRecordingDate(dateText) {
  const index = selectedRecordingDates.indexOf(dateText);
  if (index > -1) {
    selectedRecordingDates.splice(index, 1);
  } else {
    selectedRecordingDates.push(dateText);
  }
  selectedRecordingDates.sort();
  updateRecordingDatesDisplay();
  $('#recordingCalendar').datepicker('refresh');
}

// ✅ 선택된 녹화 날짜 표시
function updateRecordingDatesDisplay() {
  if (selectedRecordingDates.length === 0) {
    $('#selectedRecordingDates').text('');
    return;
  }
  
  const formatted = selectedRecordingDates.map(d => {
    const date = new Date(d);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = weekdayName[date.getDay()];
    return `${month}/${day}(${dayOfWeek})`;
  }).join(', ');
  
  $('#selectedRecordingDates').text(`선택된 녹화일: ${formatted}`);
}

// 녹화강의 가능 여부 업데이트
function updateRecordingAvailability() {
  const courseKey = $('#course').val();
  const courseType = $('input[name="courseType"]:checked')?.val();
  
  if (!courseKey) {
    $('#recordingToggle').prop('disabled', true).prop('checked', false);
    $('#recordingCalendarSection').hide();
    return;
  }
  
  let canRecord = false;
  
  if (recordingAvailable[courseKey]) {
    if (typeof recordingAvailable[courseKey] === 'object') {
      canRecord = recordingAvailable[courseKey][courseType] || false;
    } else {
      canRecord = recordingAvailable[courseKey];
    }
  }
  
  $('#recordingToggle').prop('disabled', !canRecord);
  
  if (!canRecord) {
    $('#recordingToggle').prop('checked', false);
    $('#recordingCalendarSection').hide();
    selectedRecordingDates = [];
  }
}

function dayFilter(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  
  if (year === 2025 && month === 11) {
    if ([1, 6, 8, 13].includes(day)) {
      return [false, ""];
    }
  }
  
  if (!enabledDays) return [true, ""];
  return [enabledDays.includes(date.getDay()), ""];
}

function setDatepickerEnabledDays() {
  const courseKey = document.getElementById('course').value;
  const c = courseInfo[courseKey];
  if (!c) {
    enabledDays = null;
  } else {
    enabledDays = c.days || null;
  }
  $('#startDate').datepicker('destroy');
  $('#startDate').val('');
  $('#startDate').datepicker({
    dateFormat: "yy-mm-dd",
    showButtonPanel: true,
    changeMonth: true,
    changeYear: true,
    beforeShowDay: dayFilter,
    minDate: new Date(2025, 11, 1),
    maxDate: new Date(2026, 0, 31)
  });
}

// 시작일 또는 기간 변경 시 녹화 달력 재초기화
$('#startDate, #duration').on('change', function() {
  if ($('#recordingToggle').is(':checked')) {
    selectedRecordingDates = [];
    initRecordingCalendar();
  }
});

$.datepicker.setDefaults({
  dateFormat: 'yy-mm-dd',
  prevText: '이전 달',
  nextText: '다음 달',
  monthNames: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
  monthNamesShort: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
  dayNames: ['일','월','화','수','목','금','토'],
  dayNamesShort: ['일','월','화','수','목','금','토'],
  dayNamesMin: ['일','월','화','수','목','금','토'],
  showMonthAfterYear: true,
  yearSuffix: '년'
});

$('#startDate').datepicker({
  dateFormat: "yy-mm-dd",
  showButtonPanel: true,
  changeMonth: true,
  changeYear: true,
  beforeShowDay: dayFilter,
  minDate: new Date(2025, 11, 1),
  maxDate: new Date(2026, 0, 31)
});

function applySelect2ToDuration() {
  $('#duration').select2({
    minimumResultsForSearch: Infinity,
    dropdownParent: $('.form-group.duration'),
    width: 'style',
    language: "ko"
  });
}

$(document).ready(function() {
  applySelect2ToDuration();
  
  $('#addAPCourseBtn').on('click', function(e) {
    $('#courseTreeMenuWrap').show();
    $('#courseSearchBox').val('');
    $('#courseTreeMenu > ul > li').show();
    $('#courseTreeMenu > ul > li').each(function() {
      if ($(this).data('cat') !== 'AP') {
        $(this).hide();
      } else {
        $(this).find('ul').show();
      }
    });
    $(document).off('mousedown.coursemenu').on('mousedown.coursemenu', function(evt){
      if (!$(evt.target).closest('#courseTreeMenuWrap,#courseSelectorBtn').length)
        $('#courseTreeMenuWrap').hide();
    });
    e.stopPropagation();
  });
});

function renderCourseTreeMenu() {
  let html = '<ul>';
  for (const grp of courseTree) {
    html += `<li class="maincat" data-cat="${grp.cat}">${grp.cat}<ul>`;
    for (const c of grp.items)
      html += `<li data-val="${c.val}">${c.label}</li>`;
    html += `</ul></li>`;
  }
  html += '</ul>';
  $('#courseTreeMenu').html(html);
  let sel = $('#course'); sel.empty();
  for (const grp of courseTree) {
    let optg = $(`<optgroup label="${grp.cat}"></optgroup>`);
    for (const c of grp.items) {
      optg.append(`<option value="${c.val}">${c.label}</option>`);
    }
    sel.append(optg);
  }
}
renderCourseTreeMenu();

$('#courseSelectorBtn').on('click', function(e){
  $('#courseSearchBox').val('');
  $('#courseTreeMenu > ul > li').show().find('ul li').show();
  $('#courseTreeMenu > ul > li').find('ul').hide();
  $('#courseTreeMenuWrap').toggle();
  $(document).off('mousedown.coursemenu').on('mousedown.coursemenu', function(evt){
    if (!$(evt.target).closest('#courseTreeMenuWrap,#courseSelectorBtn').length)
      $('#courseTreeMenuWrap').hide();
  });
  e.stopPropagation();
});

$('#courseTreeMenu').on('click', 'li.maincat', function(e){
  $(this).find('ul').slideToggle(120);
  $(this).siblings().find('ul').slideUp(100);
  e.stopPropagation();
});

function handleCourseSelection(courseVal, courseLabel, isAPMultiselect = false) {
  if (isAPMultiselect) {
    addAPCourseItem(courseVal, courseLabel);
    $('#courseTreeMenuWrap').hide();
    return;
  }
  
  $('#courseSelectorBtn').val(courseLabel);
  $('#selectedCourseLabel').text('');
  $('#courseSelectorBtn').data('courseval', courseVal);
  $('#courseTreeMenuWrap').hide();
  $('#course').val(courseVal).trigger('change');
}

$('#courseTreeMenu').on('click', 'ul li[data-val]', function(e){
  let courseVal = $(this).data('val');
  let courseLabel = $(this).text();
  let parentCat = $(this).closest('.maincat').data('cat');
  let isAP = parentCat === 'AP';
  
  if (isAP && $('#APCourseMultiselect').is(':visible')) {
    handleCourseSelection(courseVal, courseLabel, true);
  } else {
    handleCourseSelection(courseVal, courseLabel, false);
  }
  e.stopPropagation();
});

$('#courseTreeMenu ul > li.maincat:first-child ul').show();

$('#courseSearchBox').on('input', function(){
  let kw = $(this).val().toLowerCase().trim();
  $('#courseTreeMenu > ul > li').each(function(){
    let matched = false;
    $(this).find('ul li').each(function(){
      if (!kw || $(this).text().toLowerCase().includes(kw)) {
        $(this).show();
        matched = true;
      } else $(this).hide();
    });
    if (matched) {
      $(this).show();
      $(this).find('ul').show();
    } else {
      $(this).hide();
      $(this).find('ul').hide();
    }
  });
});

// ✅ AP 과목 추가 함수 (녹화강의 기능 포함)
function addAPCourseItem(courseVal, courseLabel) {
  if (selectedAPCourses.some(c => c.key === courseVal)) {
    return showToast('이미 선택된 과목입니다.');
  }

  const newId = Date.now();
  
  const newCourse = {
    id: newId,
    key: courseVal,
    name: courseLabel,
    duration: courseInfo[courseVal].min,
    session: '1',
    timeSlot: '1차',
    recordingDates: []
  };
  selectedAPCourses.push(newCourse);
  
  let cInfo = courseInfo[courseVal];
  let maxDuration = cInfo.max;

  let durationOptions = '';
  for(let i=cInfo.min; i<=maxDuration; ++i) {
    durationOptions += `<option value="${i}">${i}주</option>`;
  }

  let recordingToggleHtml = `
    <div class="ap-recording-toggle">
      <span style="font-weight:600;font-size:15px;">녹화강의</span>
      <label class="switch">
        <input type="checkbox" class="ap-recording-toggle-input" data-id="${newId}">
        <span class="slider"></span>
      </label>
    </div>
    <div class="ap-recording-calendar" data-id="${newId}" style="display:none;">
      <div class="ap-recording-calendar-inner" id="apRecordingCalendar-${newId}"></div>
      <div class="ap-recording-dates-display" id="apRecordingDates-${newId}"></div>
    </div>`;

  let html = `
  <div class="ap-course-item" data-id="${newId}" data-key="${courseVal}">
    <span class="course-title">${courseLabel}</span>
    <button type="button" class="remove-btn" onclick="removeAPCourseItem(${newId})">삭제</button>
    
    <div class="ap-option-row">
      <label>기간</label>
      <select class="ap-duration-select" data-id="${newId}">
        ${durationOptions}
      </select>
    </div>
    
    <div class="ap-option-row">
      <label>차수</label>
      <select class="ap-session-select" data-id="${newId}" onchange="updateAPTimeSlotUI(${newId}, this.value)">
        <option value="1">1차 (${apSessionInfo['1'].start})</option>
        <option value="2">2차 (${apSessionInfo['2'].start})</option>
        <option value="3">3차 (${apSessionInfo['3'].start})</option>
      </select>
    </div>
    
    <div class="ap-option-row ap-time-slot-row-${newId}" style="display:none;">
      <label>시간대</label>
      <label><input type="radio" name="apTimeSlot-${newId}" value="오전반" checked> 오전반</label>
      <label><input type="radio" name="apTimeSlot-${newId}" value="저녁반"> 저녁반</label>
    </div>
    
    ${recordingToggleHtml}
  </div>`;

  $('#APCourseItemsContainer').append(html);
  
  // 기간 변경 이벤트
  $(`.ap-duration-select[data-id="${newId}"]`).on('change', function() {
    const duration = parseInt($(this).val());
    const course = selectedAPCourses.find(c => c.id === newId);
    if (course) {
      course.duration = duration;
      if ($(`.ap-recording-toggle-input[data-id="${newId}"]`).is(':checked')) {
        course.recordingDates = [];
        initAPRecordingCalendar(newId);
      }
    }
  });

  // 차수 변경 이벤트
  $(`.ap-session-select[data-id="${newId}"]`).on('change', function() {
    const session = $(this).val();
    const course = selectedAPCourses.find(c => c.id === newId);
    if (course) {
      course.session = session;
      if (session === '3') {
        course.timeSlot = $('input[name="apTimeSlot-'+newId+'"]:checked').val() || '오전반';
      } else {
        course.timeSlot = `${session}차`;
      }
      if ($(`.ap-recording-toggle-input[data-id="${newId}"]`).is(':checked')) {
        course.recordingDates = [];
        initAPRecordingCalendar(newId);
      }
    }
  });
  
  $(`input[name="apTimeSlot-${newId}"]`).on('change', function() {
    const course = selectedAPCourses.find(c => c.id === newId);
    if (course) course.timeSlot = $(this).val();
  });

  // ✅ AP 과목 녹화강의 토글
  $(`.ap-recording-toggle-input[data-id="${newId}"]`).on('change', function() {
    if ($(this).is(':checked')) {
      $(`.ap-recording-calendar[data-id="${newId}"]`).show();
      initAPRecordingCalendar(newId);
    } else {
      $(`.ap-recording-calendar[data-id="${newId}"]`).hide();
      const course = selectedAPCourses.find(c => c.id === newId);
      if (course) course.recordingDates = [];
      $(`#apRecordingDates-${newId}`).text('');
    }
  });

  updateAPTimeSlotUI(newId, '1');
}

// ✅ AP 과목별 녹화 달력 초기화 (하이라이트 정확화)
function initAPRecordingCalendar(id) {
  const course = selectedAPCourses.find(c => c.id === id);
  if (!course) return;
  
  const cInfo = courseInfo[course.key];
  const session = course.session;
  const duration = course.duration;
  
  const sessionStartDate = new Date(apSessionInfo[session].start);
  let selectableDates = [];
  
  // 수강 기간 내의 모든 평일(월~금)을 선택 가능하게 설정
  let currentDate = new Date(sessionStartDate);
  let endDate = new Date(sessionStartDate);
  endDate.setDate(sessionStartDate.getDate() + (duration * 7) - 1);
  
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    // 평일(1~5)만 선택 가능
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      const dateStr = currentDate.toISOString().split('T')[0];
      selectableDates.push(dateStr);
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  $(`#apRecordingCalendar-${id}`).datepicker('destroy');
  $(`#apRecordingCalendar-${id}`).datepicker({
    dateFormat: "yy-mm-dd",
    minDate: new Date(2025, 11, 1),
    maxDate: new Date(2026, 0, 31),
    firstDay: 0,
    beforeShowDay: function(date) {
      // 시간대 문제 해결: 로컬 시간 기준으로 날짜 계산
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      const isSelectable = selectableDates.includes(dateStr);
      const isSelected = course.recordingDates.includes(dateStr);
      
      if (isSelected) {
        return [true, 'ui-state-highlight', ''];
      }
      if (!isSelectable) {
        return [false, 'ui-state-disabled', ''];
      }
      return [true, '', ''];
    },
    onSelect: function(dateText) {
      const idx = course.recordingDates.indexOf(dateText);
      if (idx > -1) {
        course.recordingDates.splice(idx, 1);
      } else {
        course.recordingDates.push(dateText);
      }
      course.recordingDates.sort();
      updateAPRecordingDatesDisplay(id);
      $(`#apRecordingCalendar-${id}`).datepicker('refresh');
    }
  });
  
  updateAPRecordingDatesDisplay(id);
}

// ✅ AP 과목 녹화 날짜 토글
function toggleAPRecordingDate(id, dateText) {
  const course = selectedAPCourses.find(c => c.id === id);
  if (!course) return;
  
  const index = course.recordingDates.indexOf(dateText);
  if (index > -1) {
    course.recordingDates.splice(index, 1);
  } else {
    course.recordingDates.push(dateText);
  }
  course.recordingDates.sort();
  updateAPRecordingDatesDisplay(id);
  $(`#apRecordingCalendar-${id}`).datepicker('refresh');
}

// ✅ AP 과목 선택된 녹화 날짜 표시
function updateAPRecordingDatesDisplay(id) {
  const course = selectedAPCourses.find(c => c.id === id);
  if (!course || course.recordingDates.length === 0) {
    $(`#apRecordingDates-${id}`).text('');
    return;
  }
  
  const formatted = course.recordingDates.map(d => {
    const date = new Date(d);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = weekdayName[date.getDay()];
    return `${month}/${day}(${dayOfWeek})`;
  }).join(', ');
  
  $(`#apRecordingDates-${id}`).text(`선택된 녹화일: ${formatted}`);
}

function updateAPTimeSlotUI(id, session) {
  const timeSlotRow = $(`.ap-time-slot-row-${id}`);
  const course = selectedAPCourses.find(c => c.id === id);
  
  if (session === '3') {
    timeSlotRow.show();
    if (course) course.timeSlot = $('input[name="apTimeSlot-'+id+'"]:checked').val() || '오전반';
  } else {
    timeSlotRow.hide();
    if (course) course.timeSlot = `${session}차`;
  }
}

function removeAPCourseItem(id) {
  selectedAPCourses = selectedAPCourses.filter(c => c.id !== id);
  $(`.ap-course-item[data-id="${id}"]`).remove();
  
  if (selectedAPCourses.length === 0) {
    $('#APCourseMultiselect').hide();
    $('#singleCourseOptions').show();
    $('#courseGroup').removeClass('ap-multiselect-active');
    $('#courseSelectorBtn').show();
    $('#selectedCourseLabel').show();
    $('#course').val('');
    document.getElementById('durationLabel').textContent = `수강 기간`;
    document.getElementById('resultsContainer').style.display = 'none';
    document.getElementById('copyButton').style.display = 'none';
    $('#resultsContainer').empty();
  }
}

document.getElementById('course').onchange = function() {
  let v = this.value;
  let box = document.getElementById('extraOptions');
  box.innerHTML = '';
  
  try { $('#duration').select2('destroy'); } catch(e){}
  $('#duration').empty();

  const c = courseInfo[v];
  const isAP = c && c.isAP;
  
  if (isAP) {
    $('#APCourseMultiselect').show();
    $('#singleCourseOptions').hide();
    $('#courseGroup').addClass('ap-multiselect-active');
    $('#courseSelectorBtn').val(`AP: ${c.name}`);
    
    if (!selectedAPCourses.some(c => c.key === v)) {
      selectedAPCourses = [];
      $('#APCourseItemsContainer').empty();
      addAPCourseItem(v, c.name);
    }
    
  } else if (!v || !c) {
    $('#APCourseMultiselect').hide();
    $('#singleCourseOptions').show();
    $('#courseGroup').removeClass('ap-multiselect-active');
    $('#courseSelectorBtn').show();
    $('#selectedCourseLabel').show();

    document.getElementById('startDateGroup').style.display = 'flex';
    setDatepickerEnabledDays();
    applySelect2ToDuration();
    document.getElementById('durationLabel').textContent = `수강 기간`;
    updateRecordingAvailability();
    
  } else {
    $('#APCourseMultiselect').hide();
    $('#singleCourseOptions').show();
    $('#courseGroup').removeClass('ap-multiselect-active');
    $('#courseSelectorBtn').show();
    $('#selectedCourseLabel').show();
    
    selectedAPCourses = [];
    
    let unit = (c.durationType==='set') ? 'set' : '주';
    document.getElementById('durationLabel').textContent = `수강 기간${unit==='set'?'(set)':''}`;
    document.getElementById('startDateGroup').style.display = 'flex';
    setDatepickerEnabledDays();

    if (['sat_1500', 'sat_1400', 'sat_bridge'].includes(v)) {
      let html = '<div class="option-group">';
      html += '<div class="option-row"><b>수업 형태:</b>';
      html += '<label><input type="radio" name="courseType" value="온라인" checked> 온라인</label>';
      html += '<label><input type="radio" name="courseType" value="오프라인"> 오프라인</label>';
      html += '</div></div>';
      box.innerHTML = html;
      $('input[name="courseType"]').on('change', updateRecordingAvailability);
    } else if (['toefl_l1', 'toefl_l2'].includes(v)) {
      let html = '<div class="option-group">';
      html += '<div class="option-row"><b>수업 형태:</b>';
      html += '<label><input type="radio" name="courseType" value="온라인" checked> 온라인</label>';
      html += '<label><input type="radio" name="courseType" value="오프라인"> 오프라인</label>';
      html += '</div></div>';
      box.innerHTML = html;
      $('input[name="courseType"]').on('change', updateRecordingAvailability);
    } else if (['drw_morning', 'drw_a', 'drw_b'].includes(v)) {
      let html = '<div class="form-group" style="margin-bottom:28px;">';
      html += '<label for="drwLevel" style="font-weight:bold;margin-right:8px;font-size:17px;min-width:110px;text-align:left;">레벨</label>';
      html += '<select id="drwLevel" style="width:100px;height:48px;font-size:17px;padding:0 16px;border-radius:7px;border:1px solid #bbb;background:#fff;">';
      html += '<option value="L1">L1</option>';
      html += '<option value="L2">L2</option>';
      html += '</select>';
      html += '</div>';
      box.innerHTML = html;
    } else if (v === 'dm_alg2') {
      let html = '<div class="option-group">';
      html += '<div class="option-row"><b>수업 형태:</b>';
      html += '<label><input type="radio" name="courseType" value="온라인" checked> 온라인</label>';
      html += '<label><input type="radio" name="courseType" value="오프라인"> 오프라인</label>';
      html += '</div></div>';
      box.innerHTML = html;
      $('input[name="courseType"]').on('change', updateRecordingAvailability);
    }
    
    for(let i=c.min; i<=c.max; ++i) {
      let label = (unit==='set') ? `${i}set` : `${i}${unit}`;
      $('#duration').append(`<option value="${i}">${label}</option>`);
    }
    applySelect2ToDuration();
    updateRecordingAvailability();
  }
};
$('#course').on('change', function() {
  const courseKey = $(this).val();
  const cInfo = courseInfo[courseKey];

  // AP 과목일 때도 녹화강의 달력 활성화
  if (cInfo && cInfo.isAP) {
    $('#recordingToggle').prop('disabled', false);
    $('#recordingCalendarSection').show();
    initRecordingCalendar(); // 일반 수업 달력 로직 그대로 사용
  } else {
    updateRecordingAvailability(); // 기존 로직 유지
  }
});
function getEndDate(startDate, durationWeeks, endDayOfWeek) {
  let start = new Date(startDate);
  let end = new Date(start);
  
  end.setDate(start.getDate() + (durationWeeks - 1) * 7);
  
  let currentDay = end.getDay();
  let targetDay = endDayOfWeek;
  
  if (currentDay <= targetDay) {
    end.setDate(end.getDate() + (targetDay - currentDay));
  } else {
    end.setDate(end.getDate() + (7 - currentDay + targetDay));
  }
  return end;
}

function getCourseDetails(cKey, duration, session, timeSlot, customStartDate) {
  const c = courseInfo[cKey];
  let timeStr = "";
  let durationStr = "";
  let totalFee = c.fee * duration;
  
  if (c.isAP) {
    const sInfo = apSessionInfo[session];
    let startDate = sInfo.start;
    let start = new Date(startDate);

    const sessionStartDate = new Date(sInfo.start);
    const sessionStartDayOfWeek = sessionStartDate.getDay();

    let actualStartDayOfWeek = -1;
    if (c.days) {
      for (const day of c.days) {
        if (day >= sessionStartDayOfWeek) {
          actualStartDayOfWeek = day;
          break;
        }
      }
    }
    
    if (actualStartDayOfWeek === -1 && c.days && c.days.length > 0) {
      actualStartDayOfWeek = c.days[0];
    } else if (actualStartDayOfWeek === -1) {
      actualStartDayOfWeek = sessionStartDayOfWeek;
    }

    let daysToAdd = actualStartDayOfWeek - sessionStartDayOfWeek;
    if (daysToAdd < 0) {
      daysToAdd += 7;
    }

    start.setDate(sessionStartDate.getDate() + daysToAdd);
    startDate = `${start.getFullYear()}-${(start.getMonth()+1).toString().padStart(2, '0')}-${start.getDate().toString().padStart(2, '0')}`;

    let end = getEndDate(startDate, duration, c.endDay);
    
    let sm = start.getMonth()+1, sd = start.getDate(), sw = weekdayName[start.getDay()];
    let em = end.getMonth()+1, ed = end.getDate(), ew = weekdayName[end.getDay()];
    durationStr = `${sm}.${sd}(${sw}) ~ ${em}.${ed}(${ew}) (${duration}주)`;
    
    let timeKey = session === '3' ? (timeSlot === '오전반' ? `3차오전` : `3차저녁`) : `${session}차`;
    timeStr = timeTable[c.name][timeKey] + " (한국시간)";

    let timeKeyForConflict = timeKey;
    
    return { durationStr, timeStr, totalFee, timeKeyForConflict, rawTimeStr: timeTable[c.name][timeKey] };

  } else if (c.durationType === 'set') {
    let startDate = customStartDate;
    let start = new Date(startDate);
    let weekGroups = [];
    for(let i=0; i<duration; i++) {
      let sat = new Date(start);
      sat.setDate(start.getDate() + 7*i);
      let sun = new Date(sat);
      sun.setDate(sat.getDate()+1);
      weekGroups.push(`${sat.getMonth()+1}.${sat.getDate()},${sun.getMonth()+1}.${sun.getDate()}`);
    }
    durationStr = weekGroups.join(' / ');
    timeStr = timeTable[c.name] + " (한국시간)";
    
  } else {
    let startDate = customStartDate;
    let start = new Date(startDate);
    let end = getEndDate(startDate, duration, c.endDay !== undefined ? c.endDay : 5);
    
    let sm = start.getMonth()+1, sd = start.getDate(), sw = weekdayName[start.getDay()];
    let em = end.getMonth()+1, ed = end.getDate(), ew = weekdayName[end.getDay()];
    durationStr = `${sm}.${sd}(${sw}) ~ ${em}.${ed}(${ew}) (${duration}주)`;

    let courseType = document.querySelector('input[name="courseType"]:checked')?.value;
    
    if (typeof timeTable[c.name] === 'object') {
      timeStr = timeTable[c.name][courseType] + " (한국시간)";
    } else {
      timeStr = timeTable[c.name] + " (한국시간)";
    }
  }
  
  return { durationStr, timeStr, totalFee };
}

// ✅ 녹화강의 수강료 계산 함수
function calculateRecordingFee(baseFee, totalDays, recordingDays, discount) {
  const normalDays = totalDays - recordingDays;
const dailyFee = baseFee / totalDays;
  
  const recordingCost = dailyFee * recordingDays * 0.4;
  const normalCost = dailyFee * normalDays * (1 - discount);
  
  return {
    recording: Math.round(recordingCost),
    normal: Math.round(normalCost),
    total: Math.round(recordingCost + normalCost)
  };
}

// ✅ 수정된 계산 함수 (전체 선택 불가 검증)
function calculateTuition() {
  let studentName = document.getElementById('studentName').value.trim();
  let mainCourseKey = document.getElementById('course').value;
  const c = courseInfo[mainCourseKey];
  
  if (!studentName) return showToast('이름을 입력하세요.');
  if (!mainCourseKey || !c) return showToast('과목을 선택하세요.');
  
  let totalFee = 0;
  let finalResultsHtml = '';
  let allCourseDetails = [];
  let isAPMultiselectMode = c.isAP && selectedAPCourses.length > 0;
  let discount = parseFloat(document.getElementById('discount').value);
  
  document.getElementById('resultsContainer').style.display = 'none';
  $('#resultsContainer').empty();
  document.getElementById('copyButton').style.display = 'none';
  
  if (isAPMultiselectMode) {
    if (selectedAPCourses.length === 0) {
      return showToast('AP 과목을 하나 이상 선택하고 옵션을 설정하세요.');
    }
    
    let timeIdentifiers = [];
    let conflict = false;

    for (const courseItem of selectedAPCourses) {
      const cKey = courseItem.key;
      const cInfo = courseInfo[cKey];
      
      const uiDuration = parseInt($(`.ap-duration-select[data-id="${courseItem.id}"]`).val());
      const uiSession = $(`.ap-session-select[data-id="${courseItem.id}"]`).val();
      let uiTimeSlot = '';
      if (uiSession === '3') {
        uiTimeSlot = $(`input[name="apTimeSlot-${courseItem.id}"]:checked`).val();
      } else {
        uiTimeSlot = `${uiSession}차`;
      }
      
      const details = getCourseDetails(cKey, uiDuration, uiSession, uiTimeSlot);
      
      // ✅ 수정된 검증: 전체를 녹화강의로 선택 불가
      const recordingDays = courseItem.recordingDates.length;
      const totalDays = uiDuration * 5;
      
      if (recordingDays > 0 && recordingDays >= totalDays) {
        return showToast(`${cInfo.name}: 최소 1일은 실시간 수업으로 진행되어야 합니다.`);
      }
      
      let finalFee, normalFee, recordingFee;
      let hasRecording = recordingDays > 0;
      
      if (hasRecording) {
        const fees = calculateRecordingFee(details.totalFee, totalDays, recordingDays, discount);
        normalFee = fees.normal;
        recordingFee = fees.recording;
        finalFee = fees.total;
      } else {
        finalFee = Math.round(details.totalFee * (1 - discount));
        normalFee = finalFee;
        recordingFee = 0;
      }
      
      totalFee += finalFee;

      let currentInfo = {
        session: uiSession,
        time: details.rawTimeStr,
        days: (cInfo.days || []).map(Number)
      };

      for (const existing of timeIdentifiers) {
        const sameSession = existing.session === currentInfo.session;
        const sameTime = existing.time === currentInfo.time;
        const overlapDays = existing.days.some(day => currentInfo.days.includes(day));
        
        if (sameSession && sameTime && overlapDays) {
          conflict = true;
          break;
        }
      }
      timeIdentifiers.push(currentInfo);

      let feeStr = finalFee.toLocaleString() + "원";
      let feeBreakdown = '';
      
      if (hasRecording) {
        const normalDaysCount = totalDays - recordingDays;
        feeBreakdown = `<div class="fee-breakdown">`;
        if (discount > 0) {
          feeBreakdown += `・ 실시간수업(${normalDaysCount}일): ${normalFee.toLocaleString()}원 (${Math.round(discount*100)}% 할인)<br>`;
        } else {
          feeBreakdown += `・ 실시간수업(${normalDaysCount}일): ${normalFee.toLocaleString()}원<br>`;
        }
        feeBreakdown += `+ 녹화강의(${recordingDays}일): ${recordingFee.toLocaleString()}원 (정가의 40%)`;
        feeBreakdown += `</div>`;
      } else if (discount > 0) {
        feeBreakdown = `<div class="fee-breakdown">・ 실시간수업(${totalDays}일): ${normalFee.toLocaleString()}원 (${Math.round(discount*100)}% 할인)</div>`;
      }

      let recordingDatesStr = '';
      if (hasRecording) {
        const formatted = courseItem.recordingDates.map(d => {
          const date = new Date(d);
          const month = date.getMonth() + 1;
          const day = date.getDate();
          const dayOfWeek = weekdayName[date.getDay()];
          return `${month}/${day}(${dayOfWeek})`;
        }).join(', ');
        recordingDatesStr = `<p>▶ <b>녹화강의</b>: ${formatted}</p>`;
      }

      allCourseDetails.push({
        name: cInfo.name,
        duration: details.durationStr,
        recording: recordingDatesStr,
        time: details.timeStr,
        fee: feeStr,
        feeBreakdown: feeBreakdown,
        totalFee: finalFee
      });
    }
    
    if (conflict) {
      return showToast('선택한 AP 과목 중 동일한 차수/시간대에 겹치는 수업이 있습니다!');
    }
    
    let finalFeeSum = 0;
    allCourseDetails.forEach(d => {
      finalResultsHtml += `
        <div class="ap-result-item" data-name="${d.name}">
          <p>▶ <b>학생이름</b>: ${studentName}</p>
          <p>▶ <b>수강과목</b>: ${d.name}</p>
          <p>▶ <b>수강기간</b>: ${d.duration}</p>
          ${d.recording}
          <p>▶ <b>수업시간</b>: ${d.time}</p>
          <p>▶ <b>수강료</b>: ${d.fee}</p>
          ${d.feeBreakdown}
          <span class="ap-warning">※ AP수업은 과목별 3명 이상일시 개강됩니다. 미개강시 납부하신 수강료는 전액 환불됩니다.</span>
        </div>`;
        finalFeeSum += d.totalFee;
    });

    $('#resultsContainer').html(finalResultsHtml);
    $('#resultsContainer').data('total-fee', finalFeeSum.toLocaleString() + "원");
    $('#resultsContainer').data('all-details', allCourseDetails);
    
    if (selectedAPCourses.length === 1) {
      const singleDetail = allCourseDetails[0];
      $('#resultsContainer').data('single-details', {
        name: studentName,
        course: singleDetail.name,
        period: singleDetail.duration,
        recording: singleDetail.recording,
        time: singleDetail.time,
        fee: singleDetail.fee,
        feeBreakdown: singleDetail.feeBreakdown
      });
    }
    
  } else {
    // 단일 과목 모드
    let startDate = document.getElementById('startDate').value;
    if (!startDate) return showToast('수강 시작일을 입력하세요.');
    
    let period = +document.getElementById('duration').value;
    let courseType = document.querySelector('input[name="courseType"]:checked')?.value;
    let drwLevel = document.getElementById('drwLevel')?.value;
    
    if (['sat_1500', 'sat_1400', 'sat_bridge', 'toefl_l1', 'toefl_l2', 'dm_alg2'].includes(mainCourseKey) && !courseType) 
      return showToast('수업 형태를 선택하세요.');
    if (['drw_morning', 'drw_a', 'drw_b'].includes(mainCourseKey) && !drwLevel) 
      return showToast('레벨을 선택하세요.');
    
    // ✅ 수정된 검증: 전체를 녹화강의로 선택 불가
    const recordingDays = selectedRecordingDates.length;
    const totalDays = period * 5;
    
    if (recordingDays > 0 && recordingDays >= totalDays) {
      return showToast('최소 1일은 실시간 수업으로 진행되어야 합니다.');
    }
    
    let displayCourseName = c.name;
    if (['drw_morning', 'drw_a', 'drw_b'].includes(mainCourseKey)) {
      if (mainCourseKey === 'drw_morning') displayCourseName = `겨울특강 DRW 오전 ${drwLevel}`;
      else if (mainCourseKey === 'drw_a') displayCourseName = `겨울특강 DRW ${drwLevel}A`;
      else if (mainCourseKey === 'drw_b') displayCourseName = `겨울특강 DRW ${drwLevel}B`;
    }
    if (mainCourseKey === 'toefl_awesome') {
      displayCourseName = displayCourseName + ' ' + period + 'set';
    }
    if (['sat_1500', 'sat_1400', 'sat_bridge', 'toefl_l1', 'toefl_l2', 'dm_alg2'].includes(mainCourseKey)) {
      displayCourseName = c.name + ' ' + courseType;
    }

    const details = getCourseDetails(mainCourseKey, period, null, null, startDate);
    
    let finalFee, normalFee, recordingFee;
    let hasRecording = recordingDays > 0;
    
    if (hasRecording) {
      const fees = calculateRecordingFee(details.totalFee, totalDays, recordingDays, discount);
      normalFee = fees.normal;
      recordingFee = fees.recording;
      finalFee = fees.total;
    } else {
      finalFee = Math.round(details.totalFee * (1 - discount));
      normalFee = finalFee;
      recordingFee = 0;
    }
    
    let durationStr = details.durationStr;
    let timeStr = details.timeStr;
  
    let feeStr = finalFee.toLocaleString() + "원";
    let feeBreakdown = '';
    
    if (hasRecording) {
      const normalDaysCount = totalDays - recordingDays;
      feeBreakdown = `<div class="fee-breakdown">`;
      if (discount > 0) {
        feeBreakdown += `・ 실시간수업(${normalDaysCount}일): ${normalFee.toLocaleString()}원 (${Math.round(discount*100)}% 할인)<br>`;
      } else {
        feeBreakdown += `・ 실시간수업(${normalDaysCount}일): ${normalFee.toLocaleString()}원<br>`;
      }
      feeBreakdown += `+ 녹화강의(${recordingDays}일): ${recordingFee.toLocaleString()}원 (정가의 40%)`;
      feeBreakdown += `</div>`;
    } else if (discount > 0) {
      feeBreakdown = `<div class="fee-breakdown">・ 실시간수업(${totalDays}일): ${normalFee.toLocaleString()}원 (${Math.round(discount*100)}% 할인)</div>`;
    }
    
    let recordingDatesStr = '';
    if (hasRecording) {
      const formatted = selectedRecordingDates.map(d => {
        const date = new Date(d);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const dayOfWeek = weekdayName[date.getDay()];
        return `${month}/${day}(${dayOfWeek})`;
      }).join(', ');
      recordingDatesStr = `<p>▶ <b>녹화강의</b>: ${formatted}</p>`;
    }
    
    let warning = '';
    if (c.isAP) {
      warning = `<span class="ap-warning">※ AP수업은 과목별 3명 이상일시 개강됩니다. 미개강시 납부하신 수강료는 전액 환불됩니다.</span>`;
    }

    let singleHtml = `
      <div class="ap-result-item" id="singleReservationInfo">
          <p>▶ <b>학생이름</b>: ${studentName}</p>
          <p>▶ <b>수강과목</b>: ${displayCourseName}</p>
          <p>▶ <b>수강기간</b>: ${durationStr}</p>
          ${recordingDatesStr}
          <p>▶ <b>수업시간</b>: ${timeStr}</p>
          <p>▶ <b>수강료</b>: ${feeStr}</p>
          ${feeBreakdown}
          ${warning}
      </div>`;
      
    $('#resultsContainer').html(singleHtml);
    $('#resultsContainer').data('single-details', {
      name: studentName,
      course: displayCourseName,
      period: durationStr,
      recording: recordingDatesStr,
      time: timeStr,
      fee: feeStr,
      feeBreakdown: feeBreakdown
    });
  }
  
  document.getElementById('resultsContainer').style.display = 'block';
  document.getElementById('copyButton').style.display = 'block';
}

function showToast(msg) {
  var t = document.getElementById("toast");
  t.textContent = msg; t.style.visibility = "visible"; t.style.opacity = 1;
  setTimeout(()=>{ t.style.opacity = 0; setTimeout(()=>{t.style.visibility='hidden';},500)},2000);
}

function copyReservationInfo() {
  let name = document.getElementById('studentName').value.trim();
  if (!name) return showToast('계산하기를 먼저 진행해주세요.');

  let infoText = `감사합니다. 수강 예약 안내드립니다.\n\n▶ 학생이름: ${name}\n`;

  let isAPMultiselectMode = $('.ap-result-item').length > 1;

  if (isAPMultiselectMode) {
    const allDetails = $('#resultsContainer').data('all-details');
    
    allDetails.forEach(d => {
      infoText += `\n- - - - - - - - - - - - - - - - - - - - -\n`;
      infoText += `▶ 수강과목: ${d.name}\n`;
      infoText += `▶ 수강기간: ${d.duration}\n`;
      if (d.recording) {
        const recordingText = d.recording.replace(/<[^>]*>/g, '').replace('▶ 녹화강의: ', '');
        infoText += `▶ 녹화강의: ${recordingText}\n`;
      }
      infoText += `▶ 수업시간: ${d.time}\n`;

      // ✅ 수강료와 실시간수업 사이 공백 제거
      infoText += `▶ 수강료: ${d.fee}`;
      if (d.feeBreakdown) {
        const breakdown = d.feeBreakdown
          .replace(/<div class="fee-breakdown">|<\/div>/g, '')
          .replace(/<br>/g, '\n  ')
          .replace(/ⓛ/g, 'ⓛ')
          .replace(/\+ /g, '+ ');
        infoText += '\n' + breakdown.trim() + '\n';
      }
    });
    
    let totalFee = $('#resultsContainer').data('total-fee') || '계산 오류';
    infoText += `\n- - - - - - - - - - - - - - - - - - - - -\n`;
    infoText += `▶ 총 수강료 (합계): ${totalFee}\n`;
    infoText += `※ AP수업은 과목별 3명 이상일시 개강됩니다. 미개강시 납부하신 수강료는 전액 환불됩니다.\n\n`;

  } else {
    const details = $('#resultsContainer').data('single-details');
    if (!details) return showToast('계산하기를 먼저 진행해주세요.');
    
    infoText += `▶ 수강과목: ${details.course}\n`;
    infoText += `▶ 수강기간: ${details.period}\n`;
    if (details.recording) {
      const recordingText = details.recording.replace(/<[^>]*>/g, '').replace('▶ 녹화강의: ', '');
      infoText += `▶ 녹화강의: ${recordingText}\n`;
    }
    infoText += `▶ 수업시간: ${details.time}\n`;

    // ✅ 수강료와 실시간수업 사이 공백 제거
    infoText += `▶ 수강료: ${details.fee}`;
    if (details.feeBreakdown) {
      const breakdown = details.feeBreakdown
        .replace(/<div class="fee-breakdown">|<\/div>/g, '')
        .replace(/<br>/g, '\n  ')
        .replace(/ⓛ/g, 'ⓛ')
        .replace(/\+ /g, '+ ');
      infoText += '\n' + breakdown.trim() + '\n';
    }

    let mainCourseKey = document.getElementById('course').value;
    if (courseInfo[mainCourseKey]?.isAP) {
      infoText += `※ AP수업은 과목별 3명 이상일시 개강됩니다. 미개강시 납부하신 수강료는 전액 환불됩니다.\n\n`;
    }
  }
  
  // 💳 계좌 안내 (마지막 고정 문단)
  infoText += `\n⚠️ 계좌이체는 학생이름으로 입금 부탁드리며, 현금의수증 발급받으실 휴대폰/사업자 번호를 알려주시기 바랍니다.\n` +
               `[수강료 입금 계좌]\n신한은행 140-009-205058\n(예금주: 세한아카데미외국어학원)\n`;
  
  navigator.clipboard.writeText(infoText)
    .then(()=> showToast('예약 안내가 복사되었습니다.'))
    .catch(()=> showToast('복사 실패!'));
}
