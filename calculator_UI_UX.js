// calculator_UI_UX.js 파일 (최종 수정 버전)

// script.js 파일 (데이터 정의 부분 제거됨)

// 주의: courseTree, courseInfo, timeTable, apSessionInfo는 이제 data.js 파일에 정의되어 있습니다.

$('#patchBtn').on('click', function(){
      $('#patchModal').fadeIn(120);
    });
    $('#closePatchModal, #patchModal').on('click', function(e){
      if (e.target === this) $('#patchModal').fadeOut(100);
    });
    
    $('#linkBtn').on('click', function(){
      const url = $(this).data('href');
      if (url) {
        window.location.href = url;
      }
    });

let enabledDays = null;
let selectedAPCourses = []; // 다중 선택된 AP 과목 정보 저장 배열

function dayFilter(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  
  // 12월 1, 6, 8, 13일 비활성화
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
  
  // [Bug 2 Fix] AP 과목 추가 버튼 이벤트 리스너 수정
  $('#addAPCourseBtn').on('click', function(e) {
      // 1. 과목 메뉴 표시 (토글 대신 show)
      $('#courseTreeMenuWrap').show();
      // 2. 검색창 초기화 및 전체 카테고리 표시
      $('#courseSearchBox').val('');
      $('#courseTreeMenu > ul > li').show();
      // 3. AP 외의 카테고리는 숨기고, AP 카테고리만 내용을 펼침
      $('#courseTreeMenu > ul > li').each(function() {
        if ($(this).data('cat') !== 'AP') { // data-cat 속성 사용
          $(this).hide();
        } else {
          $(this).find('ul').show();
        }
      });
      // Ensure that clicking outside closes it (re-add mousedown listener)
      $(document).off('mousedown.coursemenu').on('mousedown.coursemenu', function(evt){
          if (!$(evt.target).closest('#courseTreeMenuWrap,#courseSelectorBtn').length)
              $('#courseTreeMenuWrap').hide();
      });
      e.stopPropagation(); // Prevents event bubbling
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
  $(document).off('mousedown.coursemenu').on('mousedown.coursemenu', function(evt){ // 기존 리스너 삭제 후 재등록
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
    // AP 과목 추가 버튼을 눌러 선택한 경우: 다중 선택 목록에 추가
    addAPCourseItem(courseVal, courseLabel);
    $('#courseTreeMenuWrap').hide();
    return;
  }
  
  // 일반적인 단일 과목 선택의 경우
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
  
  // AP 다중 선택 모드가 이미 활성화되어 있고, 과목 추가 버튼으로 들어온 경우
  if (isAP && $('#APCourseMultiselect').is(':visible')) {
      handleCourseSelection(courseVal, courseLabel, true);
  } else {
      // 일반 단일 선택 모드일 때
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

// AP 다중 선택 과목 추가 함수
function addAPCourseItem(courseVal, courseLabel) {
    // 이미 선택된 과목인지 확인 (중복 방지)
    if (selectedAPCourses.some(c => c.key === courseVal)) {
        return showToast('이미 선택된 과목입니다.');
    }

    const newId = Date.now(); // 고유 ID 생성
    
    // 새 과목 정보 객체 생성
    const newCourse = {
        id: newId,
        key: courseVal,
        name: courseLabel,
        duration: courseInfo[courseVal].min, // 기본값 설정
        session: '1', // 기본값 설정
        // 3차에 시간대 구분이 필요한 과목이 있고, 기본값은 1차로 설정되므로 1차 시간대로 초기화
        timeSlot: '1차' 
    };
    selectedAPCourses.push(newCourse);
    
    let cInfo = courseInfo[courseVal];
    let maxDuration = cInfo.max;

    let durationOptions = '';
    for(let i=cInfo.min; i<=maxDuration; ++i) {
      durationOptions += `<option value="${i}">${i}주</option>`;
    }

    // HTML 템플릿
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
    </div>`;

    $('#APCourseItemsContainer').append(html);
    
    // 이벤트 리스너 재할당
    $(`.ap-duration-select[data-id="${newId}"]`).on('change', function() {
        const duration = parseInt($(this).val());
        const course = selectedAPCourses.find(c => c.id === newId);
        if (course) course.duration = duration;
    });

    $(`.ap-session-select[data-id="${newId}"]`).on('change', function() {
        const session = $(this).val();
        const course = selectedAPCourses.find(c => c.id === newId);
        if (course) {
          course.session = session;
          // 시간대 기본값 초기화: 3차일 경우 라디오 버튼 값, 아닐 경우 차수값으로 설정
          if (session === '3') {
             course.timeSlot = $('input[name="apTimeSlot-'+newId+'"]:checked').val() || '오전반';
          } else {
             course.timeSlot = `${session}차`;
          }
        }
    });
    
    $(`input[name="apTimeSlot-${newId}"]`).on('change', function() {
        const course = selectedAPCourses.find(c => c.id === newId);
        if (course) course.timeSlot = $(this).val();
    });

    // 초기 상태 반영 (3차 선택 시 시간대 표시)
    updateAPTimeSlotUI(newId, '1'); // 기본값 1차로 설정되므로 UI 업데이트
}

// 3차 선택 시 시간대 라디오 버튼 표시 로직
function updateAPTimeSlotUI(id, session) {
    const timeSlotRow = $(`.ap-time-slot-row-${id}`);
    const course = selectedAPCourses.find(c => c.id === id);
    
    if (session === '3') {
        timeSlotRow.show();
        // 3차 선택 시, course 객체의 timeSlot을 라디오 버튼 선택 값으로 업데이트
        if (course) course.timeSlot = $('input[name="apTimeSlot-'+id+'"]:checked').val() || '오전반';
    } else {
        timeSlotRow.hide();
        // 1차/2차 선택 시, course 객체의 timeSlot을 차수 값으로 업데이트
        if (course) course.timeSlot = `${session}차`;
    }
}

// AP 다중 선택 과목 삭제 함수
function removeAPCourseItem(id) {
    selectedAPCourses = selectedAPCourses.filter(c => c.id !== id);
    $(`.ap-course-item[data-id="${id}"]`).remove();
    
    // 모든 과목이 삭제되면 다중 선택 모드를 해제
    if (selectedAPCourses.length === 0) {
        $('#APCourseMultiselect').hide();
        $('#singleCourseOptions').show();
        $('#courseGroup').removeClass('ap-multiselect-active');
        $('#courseSelectorBtn').show();
        $('#selectedCourseLabel').show();
        $('#course').val(''); // 기존 과목 선택 초기화
        document.getElementById('durationLabel').textContent = `수강 기간`;
        
        // AP 모드에서 나갈 때 결과 영역 초기화 및 숨김
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
      // 1. AP 다중 선택 모드 활성화
      $('#APCourseMultiselect').show();
      $('#singleCourseOptions').hide();
      $('#courseGroup').addClass('ap-multiselect-active');
      $('#courseSelectorBtn').val(`AP: ${c.name}`);
      
      // AP 과목 추가 로직: 첫 번째 과목을 자동으로 추가
      if (!selectedAPCourses.some(c => c.key === v)) {
          selectedAPCourses = []; // 기존 AP 목록 초기화 (새로운 AP 선택 시)
          $('#APCourseItemsContainer').empty(); // UI 비우기
          addAPCourseItem(v, c.name);
      }
      
  } else if (!v || !c) {
      // 2. 초기 상태 또는 과목 미선택 시 (AP 다중 선택 모드 비활성화)
      $('#APCourseMultiselect').hide();
      $('#singleCourseOptions').show();
      $('#courseGroup').removeClass('ap-multiselect-active');
      $('#courseSelectorBtn').show();
      $('#selectedCourseLabel').show();

      document.getElementById('startDateGroup').style.display = 'flex';
      setDatepickerEnabledDays();
      applySelect2ToDuration();
      document.getElementById('durationLabel').textContent = `수강 기간`;
      
  } else {
      // 3. AP가 아닌 단일 과목 선택 시 (AP 다중 선택 모드 비활성화)
      $('#APCourseMultiselect').hide();
      $('#singleCourseOptions').show();
      $('#courseGroup').removeClass('ap-multiselect-active');
      $('#courseSelectorBtn').show();
      $('#selectedCourseLabel').show();
      
      selectedAPCourses = []; // AP 목록 초기화
      
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
      } else if (['toefl_l1', 'toefl_l2'].includes(v)) {
          let html = '<div class="option-group">';
          html += '<div class="option-row"><b>수업 형태:</b>';
          html += '<label><input type="radio" name="courseType" value="온라인" checked> 온라인</label>';
          html += '<label><input type="radio" name="courseType" value="오프라인"> 오프라인</label>';
          html += '</div></div>';
          box.innerHTML = html;
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
      }
      
      for(let i=c.min; i<=c.max; ++i) {
        let label = (unit==='set') ? `${i}set` : `${i}${unit}`;
        $('#duration').append(`<option value="${i}">${label}</option>`);
      }
      applySelect2ToDuration();
  }
};

// 특정 날짜의 요일을 찾아 종료일을 계산하는 헬퍼 함수
function getEndDate(startDate, durationWeeks, endDayOfWeek) {
    let start = new Date(startDate);
    let end = new Date(start);
    
    // (durationWeeks - 1)주 후의 같은 요일로 이동
    end.setDate(start.getDate() + (durationWeeks - 1) * 7);
    
    // 원하는 종료 요일(endDayOfWeek)로 정렬
    let currentDay = end.getDay();
    let targetDay = endDayOfWeek;
    
    // 현재 요일이 목표 요일보다 작거나 같으면 그 차이만큼 날짜 추가
    if (currentDay <= targetDay) {
        end.setDate(end.getDate() + (targetDay - currentDay));
    } else {
        // 현재 요일이 목표 요일보다 크면 다음 주 목표 요일로 이동
        end.setDate(end.getDate() + (7 - currentDay + targetDay));
    }
    return end;
}

// 개별 과목의 기간 문자열 및 수업 시간을 계산하는 헬퍼 함수
function getCourseDetails(cKey, duration, session, timeSlot, customStartDate) {
    const c = courseInfo[cKey];
    let timeStr = "";
    let durationStr = "";
    let totalFee = c.fee * duration;
    
    if (c.isAP) {
        // AP 과목 (다중 선택 모드 또는 단일 AP 선택)
        const sInfo = apSessionInfo[session];
        let startDate = sInfo.start; // 세션 시작일 (e.g., '2025-12-15' 월요일)
        let start = new Date(startDate);

        // 실제 수업 시작일을 계산합니다.
        const sessionStartDate = new Date(sInfo.start);
        const sessionStartDayOfWeek = sessionStartDate.getDay(); // 세션 시작일의 요일 (0=일, 1=월, ...)

        // c.days 중 sessionStartDayOfWeek과 같거나 뒤인 가장 빠른 요일을 찾습니다.
        let actualStartDayOfWeek = -1;
        // c.days는 오름차순으로 가정합니다.
        // **[주의: AP Psy 버그 해결의 핵심]** AP Psy의 days가 [1]에서 [1, 3, 5]로 수정되었으므로, 이 로직이 정상 작동해야 합니다.
        if (c.days) {
            for (const day of c.days) {
                if (day >= sessionStartDayOfWeek) {
                    actualStartDayOfWeek = day;
                    break;
                }
            }
        }
        
        // 만약 세션 시작 요일보다 모든 수업 요일이 앞설 경우 (e.g., 세션 시작 화요일, 수업은 월요일), 다음 주의 첫 수업일로 설정
        if (actualStartDayOfWeek === -1 && c.days && c.days.length > 0) {
            actualStartDayOfWeek = c.days[0];
        } else if (actualStartDayOfWeek === -1) {
            // days 속성이 없거나 비어있는 경우, 세션 시작일을 그대로 사용
            actualStartDayOfWeek = sessionStartDayOfWeek;
        }

        // 세션 시작일로부터 실제 첫 수업일까지의 일수 계산
        let daysToAdd = actualStartDayOfWeek - sessionStartDayOfWeek;
        if (daysToAdd < 0) {
            // 예를 들어, 세션 시작일이 화(2)인데 실제 첫 수업일이 월(1)이라면, 다음 주의 월요일을 찾아야 함
            daysToAdd += 7;
        }

        start.setDate(sessionStartDate.getDate() + daysToAdd);
        startDate = `${start.getFullYear()}-${(start.getMonth()+1).toString().padStart(2, '0')}-${start.getDate().toString().padStart(2, '0')}`;
        // 실제 시작일 계산 끝

        // 이제 실제 시작일(startDate)을 기반으로 종료일을 계산
        let end = getEndDate(startDate, duration, c.endDay);
        
        let sm = start.getMonth()+1, sd = start.getDate(), sw = weekdayName[start.getDay()];
        let em = end.getMonth()+1, ed = end.getDate(), ew = weekdayName[end.getDay()];
        durationStr = `${sm}.${sd}(${sw}) ~ ${em}.${ed}(${ew}) (${duration}주)`;
        
        // 시간 계산 (timeSlot은 '오전반', '저녁반' 또는 '1차', '2차')
        let timeKey = session === '3' ? (timeSlot === '오전반' ? `3차오전` : `3차저녁`) : `${session}차`;
        timeStr = timeTable[c.name][timeKey] + " (한국시간)";

        let timeKeyForConflict = timeKey;
        
        return { durationStr, timeStr, totalFee, timeKeyForConflict, rawTimeStr: timeTable[c.name][timeKey] };

    } else if (c.durationType === 'set') {
        // TOEFL 어썸실전 (set)
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
        // 일반 주차 과목 (SAT, DRW, Drill Math 등)
        let startDate = customStartDate;
        let start = new Date(startDate);
        let end = getEndDate(startDate, duration, c.endDay !== undefined ? c.endDay : 5); // 기본 종료일 금(5)
        
        let sm = start.getMonth()+1, sd = start.getDate(), sw = weekdayName[start.getDay()];
        let em = end.getMonth()+1, ed = end.getDate(), ew = weekdayName[end.getDay()];
        durationStr = `${sm}.${sd}(${sw}) ~ ${em}.${ed}(${ew}) (${duration}주)`;

        // 수업 시간
        let courseType = document.querySelector('input[name="courseType"]:checked')?.value;
        
        if (typeof timeTable[c.name] === 'object') {
            timeStr = timeTable[c.name][courseType] + " (한국시간)";
        } else {
            timeStr = timeTable[c.name] + " (한국시간)";
        }
    }
    
    return { durationStr, timeStr, totalFee };
}


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
  
  // ✅ [1] AP 다중 선택 모드 처리
  if (isAPMultiselectMode) {
    if (selectedAPCourses.length === 0) {
        return showToast('AP 과목을 하나 이상 선택하고 옵션을 설정하세요.');
    }
    
    let timeIdentifiers = []; // 중복 방지용
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
        totalFee += details.totalFee;

        // ✅ 개선된 시간 & 요일 중복 검사 로직
        let currentInfo = {
            session: uiSession,
            time: details.rawTimeStr,              // 예: "20:30~22:30"
            days: (cInfo.days || []).map(Number)   // 예: [2,4,6]
        };

        for (const existing of timeIdentifiers) {
            const sameSession = existing.session === currentInfo.session;
            const sameTime = existing.time === currentInfo.time;
            const overlapDays = existing.days.some(day => currentInfo.days.includes(day));
            
            // 세션, 시간, 요일이 모두 겹치면 충돌
            if (sameSession && sameTime && overlapDays) {
                conflict = true;
                break;
            }
        }
        timeIdentifiers.push(currentInfo);
        // ✅ 충돌 검사 끝

        let discountedFee = Math.round(details.totalFee * (1-discount));
        let feeStr = discountedFee.toLocaleString() + "원";
        if (discount > 0) feeStr += ` (${Math.round(discount*100)}% 할인)`;

        allCourseDetails.push({
            name: cInfo.name,
            duration: details.durationStr,
            time: details.timeStr,
            fee: feeStr,
            totalFee: discountedFee
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
            <p>▶ <b>수업시간</b>: ${d.time}</p>
            <p>▶ <b>수강료</b>: ${d.fee}</p>
            <span class="ap-warning">※ AP수업은 과목별 3명 이상일시 개강됩니다. 미개강시 납부하신 수강료는 전액 환불됩니다.</span>
          </div>`;
          finalFeeSum += d.totalFee;
    });

    $('#resultsContainer').html(finalResultsHtml);
    $('#resultsContainer').data('total-fee', finalFeeSum.toLocaleString() + "원");
    
    if (selectedAPCourses.length === 1) {
         const singleDetail = allCourseDetails[0];
         $('#resultsContainer').data('single-details', {
             name: studentName,
             course: singleDetail.name,
             period: singleDetail.duration,
             time: singleDetail.time,
             fee: singleDetail.fee
         });
    }
    
  } else {
    // ✅ [2] 단일 과목 모드
    let startDate = document.getElementById('startDate').value;
    if (!startDate) return showToast('수강 시작일을 입력하세요.');
    
    let period = +document.getElementById('duration').value;
    let courseType = document.querySelector('input[name="courseType"]:checked')?.value;
    let drwLevel = document.getElementById('drwLevel')?.value;
    
    if (['sat_1500', 'sat_1400', 'sat_bridge', 'toefl_l1', 'toefl_l2', 'dm_alg2'].includes(mainCourseKey) && !courseType) 
        return showToast('수업 형태를 선택하세요.');
    if (['drw_morning', 'drw_a', 'drw_b'].includes(mainCourseKey) && !drwLevel) 
        return showToast('레벨을 선택하세요.');
        
    let displayCourseName = c.name;
    if (['drw_morning', 'drw_a', 'drw_b'].includes(mainCourseKey)) {
      if (mainCourseKey === 'drw_morning') displayCourseName = `겨울특강 DRW 오전반 ${drwLevel}`;
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
    totalFee = details.totalFee;
    let durationStr = details.durationStr;
    let timeStr = details.timeStr;
  
    let discountedFee = Math.round(totalFee * (1-discount));
    let feeStr = discountedFee.toLocaleString() + "원";
    if (discount > 0) feeStr += ` (${Math.round(discount*100)}% 할인)`;
    
    let warning = '';
    if (c.isAP) {
        warning = `<span class="ap-warning">✅ AP수업은 과목별 3명 이상일시 개강됩니다. 미개강시 납부하신 수강료는 전액 환불됩니다.</span>`;
    }

    let singleHtml = `
      <div class="ap-result-item" id="singleReservationInfo">
          <p>▶ <b>학생이름</b>: ${studentName}</p>
          <p>▶ <b>수강과목</b>: ${displayCourseName}</p>
          <p>▶ <b>수강기간</b>: ${durationStr}</p>
          <p>▶ <b>수업시간</b>: ${timeStr}</p>
          <p>▶ <b>수강료</b>: ${feeStr}</p>
          ${warning}
      </div>`;
      
    $('#resultsContainer').html(singleHtml);
    $('#resultsContainer').data('single-details', {
        name: studentName,
        course: displayCourseName,
        period: durationStr,
        time: timeStr,
        fee: feeStr
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

// **복사 안내문 로직**
function copyReservationInfo() {
  let name = document.getElementById('studentName').value.trim();
  if (!name) return showToast('계산하기를 먼저 진행해주세요.');

  let infoText = `감사합니다. 수강 예약 안내드립니다.\n\n▶ 학생이름: ${name}\n`;

  // AP 다중 선택 모드 확인 (결과 컨테이너 내의 .ap-result-item 갯수로 판단)
  let isAPMultiselectMode = $('.ap-result-item').length > 1;

  if (isAPMultiselectMode) {
      // AP 다중 선택 모드 복사
      $('.ap-result-item').each(function() {
          // 동적으로 생성된 요소에서 텍스트 추출
          let course = $(this).find('p:nth-child(2)').text().replace('▶ 수강과목: ', '');
          let period = $(this).find('p:nth-child(3)').text().replace('▶ 수강기간: ', '');
          let time = $(this).find('p:nth-child(4)').text().replace('▶ 수업시간: ', '');
          let fee = $(this).find('p:nth-child(5)').text().replace('▶ 수강료: ', '');
          
          infoText += `- - - - - - - - - - - - - - - - - - - - -\n`;
          infoText += `▶ 수강과목: ${course}\n`;
          infoText += `▶ 수강기간: ${period}\n`;
          infoText += `▶ 수업시간: ${time}\n`;
          infoText += `▶ 수강료: ${fee}\n`; // 개별 수강료
      });
      
      // AP 합산 총 수강료 추가
      let totalFee = $('#resultsContainer').data('total-fee') || '계산 오류';
      
      infoText += `- - - - - - - - - - - - - - - - - - - - -\n`;
      infoText += `▶ 총 수강료 (합계): ${totalFee}\n\n`; // 합산 총 수강료
      infoText += `✅ AP수업은 과목별 3명 이상일시 개강됩니다. 미개강시 납부하신 수강료는 전액 환불됩니다.\n\n`;

  } else {
      // 단일 선택 모드 복사
      // 단일 과목 정보는 data 속성에 저장된 것을 사용
      const details = $('#resultsContainer').data('single-details');
      
      if (!details) return showToast('계산된 수강 정보가 없습니다. 계산하기를 먼저 진행해주세요.');
      
      infoText += `▶ 수강과목: ${details.course}\n`;
      infoText += `▶ 수강기간: ${details.period}\n`;
      infoText += `▶ 수업시간: ${details.time}\n`;
      infoText += `▶ 수강료: ${details.fee}\n\n`; // 단일 수강료

      // AP 단일 선택 시 경고 메시지 추가
      let mainCourseKey = document.getElementById('course').value;
      if (courseInfo[mainCourseKey]?.isAP) {
        infoText += `✅ AP수업은 과목별 3명 이상일시 개강됩니다. 미개강시 납부하신 수강료는 전액 환불됩니다.\n\n`;
      }
  }
  
  // 계좌 안내문 추가
  infoText += `⚠️ 계좌이체는 학생이름으로 입금 부탁드리며, 현금영수증 발급받으실 휴대폰/사업자 번호를 알려주시기 바랍니다.\n`
      + `[수강료 입금 계좌]\n신한은행 140-009-205058\n(예금주: 세한아카데미외국어학원)\n`;
  
  navigator.clipboard.writeText(infoText)
    .then(()=> showToast('예약 안내가 복사되었습니다.'))
    .catch(()=> showToast('복사 실패!'));
}