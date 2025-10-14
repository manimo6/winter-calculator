// refactored/js/ui.js

// DOM 조작, 이벤트 리스너, 화면 렌더링 등 UI 관련 모든 로직을 담당합니다.

// --- UI Helper Functions ---

function showToast(msg) {
  var t = document.getElementById("toast");
  t.textContent = msg; t.style.visibility = "visible"; t.style.opacity = 1;
  setTimeout(()=>{ t.style.opacity = 0; setTimeout(()=>{t.style.visibility='hidden';},500)},2000);
}

function applySelect2ToDuration() {
  $('#duration').select2({
    minimumResultsForSearch: Infinity,
    dropdownParent: $('.form-group.duration'),
    width: 'style',
    language: "ko"
  });
}

function formatRecordingDates(dates) {
    return dates.map(d => {
        const date = new Date(d);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const dayOfWeek = weekdayName[date.getDay()];
        return `${month}/${day}(${dayOfWeek})`;
    }).join(', ');
}

// --- DOM Rendering Functions ---

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
  $('#courseTreeMenu ul > li.maincat:first-child ul').show();
}

function renderSingleCourseOptions(courseKey) {
    const c = courseInfo[courseKey];
    $('#APCourseMultiselect').hide();
    $('#singleCourseOptions').show();
    $('#courseGroup').removeClass('ap-multiselect-active');
    $('#courseSelectorBtn').show();
    $('#selectedCourseLabel').show();
    $('#startDateGroup').css('display', 'flex');
    
    updateState({ isAPMode: false });
    resetAllAPCourses();
    $('#APCourseItemsContainer').empty();

    let box = $('#extraOptions');
    box.empty();

    if (['sat_1500', 'sat_1400', 'sat_bridge', 'toefl_l1', 'toefl_l2', 'dm_alg2'].includes(courseKey)) {
        let html = '<div class="option-group"><div class="option-row"><b>수업 형태:</b><label><input type="radio" name="courseType" value="온라인" checked> 온라인</label><label><input type="radio" name="courseType" value="오프라인"> 오프라인</label></div></div>';
        box.html(html);
    } else if (['drw_morning', 'drw_a', 'drw_b'].includes(courseKey)) {
        let html = '<div class="form-group" style="margin-bottom:28px;"><label for="drwLevel" style="font-weight:bold;margin-right:8px;font-size:17px;min-width:110px;text-align:left;">레벨</label><select id="drwLevel" style="width:100px;height:48px;font-size:17px;padding:0 16px;border-radius:7px;border:1px solid #bbb;background:#fff;"><option value="L1">L1</option><option value="L2">L2</option></select></div>';
        box.html(html);
    }

    try { $('#duration').select2('destroy'); } catch(e){}
    $('#duration').empty();
    let unit = (c.durationType==='set') ? 'set' : '주';
    $('#durationLabel').text(`수강 기간${unit==='set'?'(set)':''}`);
    for(let i=c.min; i<=c.max; ++i) {
      let label = (unit==='set') ? `${i}set` : `${i}${unit}`;
      $('#duration').append(`<option value="${i}">${label}</option>`);
    }
    applySelect2ToDuration();
    updateDatepickerEnabledDays();
    updateRecordingAvailability();
}

function renderAPCourseMode(courseKey) {
    const c = courseInfo[courseKey];
    $('#APCourseMultiselect').show();
    $('#singleCourseOptions').hide();
    $('#courseGroup').addClass('ap-multiselect-active');
    $('#courseSelectorBtn').val(`AP: ${c.name}`);

    updateState({ isAPMode: true });

    if (!state.selectedAPCourses.some(c => c.key === courseKey)) {
        resetAllAPCourses();
        $('#APCourseItemsContainer').empty();
        const result = addAPCourse(courseKey, c.name);
        if (!result.needsToast) {
            renderNewAPCourseItem(result.newCourse);
        }
    }
}

function renderNewAPCourseItem(course) {
    const cInfo = courseInfo[course.key];
    let durationOptions = '';
    for(let i=cInfo.min; i<=cInfo.max; ++i) {
        durationOptions += `<option value="${i}">${i}주</option>`;
    }

    let recordingToggleHtml = `
    <div class="ap-recording-toggle">
      <span style="font-weight:600;font-size:15px;">녹화강의</span>
      <label class="switch">
        <input type="checkbox" class="ap-recording-toggle-input" data-id="${course.id}">
        <span class="slider"></span>
      </label>
    </div>
    <div class="ap-recording-calendar" data-id="${course.id}" style="display:none;">
      <div class="ap-recording-calendar-inner" id="apRecordingCalendar-${course.id}"></div>
      <div class="ap-recording-dates-display" id="apRecordingDates-${course.id}"></div>
    </div>`;

    let html = `
    <div class="ap-course-item" data-id="${course.id}" data-key="${course.key}">
        <span class="course-title">${course.name}</span>
        <button type="button" class="remove-btn" data-id="${course.id}">삭제</button>
        <div class="ap-option-row"><label>기간</label><select class="ap-duration-select" data-id="${course.id}">${durationOptions}</select></div>
        <div class="ap-option-row"><label>차수</label><select class="ap-session-select" data-id="${course.id}"><option value="1">1차 (${apSessionInfo['1'].start})</option><option value="2">2차 (${apSessionInfo['2'].start})</option><option value="3">3차 (${apSessionInfo['3'].start})</option></select></div>
        <div class="ap-option-row ap-time-slot-row-${course.id}" style="display:none;"><label>시간대</label><label><input type="radio" name="apTimeSlot-${course.id}" value="오전반" checked> 오전반</label><label><input type="radio" name="apTimeSlot-${course.id}" value="저녁반"> 저녁반</label></div>
        ${recordingToggleHtml}
    </div>`;

    $('#APCourseItemsContainer').append(html);
    updateAPTimeSlotUI(course.id, '1');
}

function updateDatepickerEnabledDays() {
  const c = courseInfo[state.courseKey];
  const enabledDays = (c && c.days) ? c.days : null;

  $('#startDate').datepicker('destroy');
  $('#startDate').val('');
  updateState({ startDate: null });

  $('#startDate').datepicker({
    dateFormat: "yy-mm-dd",
    showButtonPanel: true, changeMonth: true, changeYear: true,
    minDate: new Date(2025, 11, 1), maxDate: new Date(2026, 0, 31),
    beforeShowDay: function(date) {
        const day = date.getDay();
        if (enabledDays) return [enabledDays.includes(day), ""];
        return [true, ""];
    }
  });
}

function updateRecordingAvailability() {
  const { courseKey, courseType } = state;
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
    updateState({ isRecordingEnabled: false });
    resetRecordingDates();
  }
}

function updateAPTimeSlotUI(id, session) {
  const timeSlotRow = $(`.ap-time-slot-row-${id}`);
  const course = updateAPCourse(id, { session });
  
  if (session === '3') {
    timeSlotRow.show();
    updateAPCourse(id, { timeSlot: $(`input[name="apTimeSlot-${id}"]:checked`).val() || '오전반' });
  } else {
    timeSlotRow.hide();
    updateAPCourse(id, { timeSlot: `${session}차` });
  }
}

function initRecordingCalendar(calendarId, getSelectableDates, onSelect, getSelectedDates, datesDisplayId) {
    $(calendarId).datepicker('destroy');
    $(calendarId).datepicker({
        dateFormat: "yy-mm-dd",
        minDate: new Date(2025, 11, 1),
        maxDate: new Date(2026, 0, 31),
        beforeShowDay: function(date) {
            const dateStr = $.datepicker.formatDate('yy-mm-dd', date);
            const selectableDates = getSelectableDates();
            const selectedDates = getSelectedDates();
            const isSelectable = selectableDates.includes(dateStr);
            const isSelected = selectedDates.includes(dateStr);
            if (isSelected) return [true, 'ui-state-highlight', ''];
            if (!isSelectable) return [false, 'ui-state-disabled', ''];
            return [true, '', ''];
        },
        onSelect: function(dateText) {
            onSelect(dateText);
            $(datesDisplayId).text(formatRecordingDates(getSelectedDates()));
            $(calendarId).datepicker('refresh');
        }
    });
    $(datesDisplayId).text(formatRecordingDates(getSelectedDates()));
}

function renderCalculationResults(results) {
    if (results.error) {
        showToast(results.error);
        $('#resultsContainer, #copyButton').hide();
        return;
    }

    let finalResultsHtml = '';
    if (results.isAPMultiselectMode) {
        results.allCourseDetails.forEach(d => {
            finalResultsHtml += createResultItemHtml(d, true);
        });
    } else {
        finalResultsHtml = createResultItemHtml(results.allCourseDetails[0], false);
    }

    $('#resultsContainer').html(finalResultsHtml).show();
    $('#copyButton').show();
    // Store data for copy function
    $('#resultsContainer').data('results', results);
}

function createResultItemHtml(detail, isAP) {
    let feeBreakdown = '';
    let feeStr = detail.totalFee.toLocaleString() + "원";
    if (detail.hasRecording) {
        const normalDaysCount = detail.totalDays - detail.recordingDates.length;
        feeBreakdown = `<div class="fee-breakdown">`;
        if (detail.discount > 0) {
            feeBreakdown += `・ 실시간수업(${normalDaysCount}일): ${detail.normalFee.toLocaleString()}원 (${Math.round(detail.discount*100)}% 할인)<br>`;
        } else {
            feeBreakdown += `・ 실시간수업(${normalDaysCount}일): ${detail.normalFee.toLocaleString()}원<br>`;
        }
        feeBreakdown += `+ 녹화강의(${detail.recordingDates.length}일): ${detail.recordingFee.toLocaleString()}원 (정가의 40%)</div>`;
    } else if (detail.discount > 0) {
        feeStr = `${detail.totalFee.toLocaleString()}원 (${Math.round(detail.discount*100)}% 할인)`;
    }

    let recordingDatesStr = detail.hasRecording ? `<p>▶ <b>녹화강의</b>: ${formatRecordingDates(detail.recordingDates)}</p>` : '';
    let warning = (isAP || detail.isAP) ? `<span class="ap-warning">※ AP수업은 과목별 3명 이상일시 개강됩니다. 미개강시 납부하신 수강료는 전액 환불됩니다.</span>` : '';

    return `
    <div class="ap-result-item" data-name="${detail.name}">
      <p>▶ <b>학생이름</b>: ${state.studentName}</p>
      <p>▶ <b>수강과목</b>: ${detail.name}</p>
      <p>▶ <b>수강기간</b>: ${detail.duration}</p>
      ${recordingDatesStr}
      <p>▶ <b>수업시간</b>: ${detail.time}</p>
      <p>▶ <b>수강료</b>: ${feeStr}</p>
      ${feeBreakdown}
      ${warning}
    </div>`;
}

function getClipboardText() {
    const results = $('#resultsContainer').data('results');
    if (!results) return null;

    let infoText = `감사합니다. 수강 예약 안내드립니다.\n\n▶ 학생이름: ${state.studentName}\n`;

    if (results.isAPMultiselectMode) {
        results.allCourseDetails.forEach(d => {
            infoText += `\n- - - - - - - - - - - - - - - - - - - - -\n`;
            infoText += `▶ 수강과목: ${d.name}\n`;
            infoText += `▶ 수강기간: ${d.duration}\n`;
            if (d.hasRecording) infoText += `▶ 녹화강의: ${formatRecordingDates(d.recordingDates)}\n`;
            infoText += `▶ 수업시간: ${d.time}\n`;
            let feeStr = d.totalFee.toLocaleString() + "원";
            if (!d.hasRecording && d.discount > 0) feeStr += ` (${Math.round(d.discount*100)}% 할인)`;
            infoText += `▶ 수강료: ${feeStr}\n`;
            if (d.hasRecording) {
                const normalDaysCount = d.totalDays - d.recordingDates.length;
                if (d.discount > 0) infoText += `  ・ 실시간수업(${normalDaysCount}일): ${d.normalFee.toLocaleString()}원 (${Math.round(d.discount*100)}% 할인)\n`;
                else infoText += `  ・ 실시간수업(${normalDaysCount}일): ${d.normalFee.toLocaleString()}원\n`;
                infoText += `  + 녹화강의(${d.recordingDates.length}일): ${d.recordingFee.toLocaleString()}원 (정가의 40%)\n`;
            }
        });
        infoText += `\n- - - - - - - - - - - - - - - - - - - - -\n`;
        infoText += `▶ 총 수강료 (합계): ${results.totalFee.toLocaleString()}원\n`;
        infoText += `※ AP수업은 과목별 3명 이상일시 개강됩니다. 미개강시 납부하신 수강료는 전액 환불됩니다.`;
    } else {
        const d = results.allCourseDetails[0];
        infoText += `▶ 수강과목: ${d.name}\n`;
        infoText += `▶ 수강기간: ${d.duration}\n`;
        if (d.hasRecording) infoText += `▶ 녹화강의: ${formatRecordingDates(d.recordingDates)}\n`;
        infoText += `▶ 수업시간: ${d.time}\n`;
        let feeStr = d.totalFee.toLocaleString() + "원";
        if (!d.hasRecording && d.discount > 0) feeStr += ` (${Math.round(d.discount*100)}% 할인)`;
        infoText += `▶ 수강료: ${feeStr}\n`;
        if (d.hasRecording) {
            const normalDaysCount = d.totalDays - d.recordingDates.length;
            if (d.discount > 0) infoText += `  ・ 실시간수업(${normalDaysCount}일): ${d.normalFee.toLocaleString()}원 (${Math.round(d.discount*100)}% 할인)\n`;
            else infoText += `  ・ 실시간수업(${normalDaysCount}일): ${d.normalFee.toLocaleString()}원\n`;
            infoText += `  + 녹화강의(${d.recordingDates.length}일): ${d.recordingFee.toLocaleString()}원 (정가의 40%)\n`;
        }
        if (d.isAP) infoText += `※ AP수업은 과목별 3명 이상일시 개강됩니다. 미개강시 납부하신 수강료는 전액 환불됩니다.`;
    }

    infoText += `\n\n⚠️ 계좌이체는 학생이름으로 입금 부탁드리며, 현금의수증 발급받으실 휴대폰/사업자 번호를 알려주시기 바랍니다.\n[수강료 입금 계좌]\n신한은행 140-009-205058\n(예금주: 세한아카데미외국어학원)\n`;
    return infoText;
}


// --- Event Handlers ---

function setupEventListeners() {
    // Modals and links
    $('#patchBtn').on('click', () => $('#patchModal').fadeIn(120));
    $('#closePatchModal, #patchModal').on('click', function(e) { if (e.target === this) $('#patchModal').fadeOut(100); });
    $('#linkBtn').on('click', function() { window.location.href = $(this).data('href'); });

    // Main form inputs
    $('#studentName').on('input', e => updateState({ studentName: e.target.value.trim() }));
    $('#discount').on('change', e => updateState({ discount: parseFloat(e.target.value) }));
    $('#startDate').on('change', function() {
        updateState({ startDate: $(this).val() });
        if (state.isRecordingEnabled) {
            resetRecordingDates();
            setupSingleRecordingCalendar();
        }
    });
    $('#duration').on('change', function() {
        updateState({ duration: parseInt($(this).val()) });
        if (state.isRecordingEnabled) {
            resetRecordingDates();
            setupSingleRecordingCalendar();
        }
    });

    // Course selection
    $('#courseSelectorBtn').on('click', function(e) {
        $('#courseSearchBox').val('');
        $('#courseTreeMenu > ul > li').show().find('ul li').show();
        $('#courseTreeMenu > ul > li').find('ul').hide();
        $('#courseTreeMenuWrap').toggle();
        $(document).off('mousedown.coursemenu').on('mousedown.coursemenu', function(evt) {
            if (!$(evt.target).closest('#courseTreeMenuWrap,#courseSelectorBtn').length) $('#courseTreeMenuWrap').hide();
        });
        e.stopPropagation();
    });

    $('#courseTreeMenu').on('click', 'li.maincat', function(e) {
        $(this).find('ul').slideToggle(120);
        $(this).siblings().find('ul').slideUp(100);
        e.stopPropagation();
    });

    $('#courseTreeMenu').on('click', 'ul li[data-val]', function(e) {
        const courseVal = $(this).data('val');
        const courseLabel = $(this).text();
        const cInfo = courseInfo[courseVal];

        updateState({ courseKey: courseVal });
        $('#courseSelectorBtn').val(courseLabel);
        $('#courseTreeMenuWrap').hide();

        if (cInfo && cInfo.isAP) {
            renderAPCourseMode(courseVal);
        } else {
            renderSingleCourseOptions(courseVal);
        }
        e.stopPropagation();
    });

    $('#courseSearchBox').on('input', function() {
        let kw = $(this).val().toLowerCase().trim();
        $('#courseTreeMenu > ul > li').each(function() {
            let matched = false;
            $(this).find('ul li').each(function() {
                if (!kw || $(this).text().toLowerCase().includes(kw)) { $(this).show(); matched = true; } 
                else { $(this).hide(); }
            });
            if (matched) { $(this).show().find('ul').show(); } 
            else { $(this).hide().find('ul').hide(); }
        });
    });

    // Dynamic options
    $('#extraOptions').on('change', 'input[name="courseType"]', function() {
        updateState({ courseType: $(this).val() });
        updateRecordingAvailability();
    });
    $('#extraOptions').on('change', '#drwLevel', function() {
        updateState({ drwLevel: $(this).val() });
    });

    // Recording toggle
    $('#recordingToggle').on('change', function() {
        const isChecked = $(this).is(':checked');
        updateState({ isRecordingEnabled: isChecked });
        if (isChecked) {
            if (!state.startDate || !state.duration) {
                showToast('수강 시작일과 기간을 먼저 선택하세요.');
                $(this).prop('checked', false);
                updateState({ isRecordingEnabled: false });
                return;
            }
            $('#recordingCalendarSection').show();
            setupSingleRecordingCalendar();
        } else {
            $('#recordingCalendarSection').hide();
            resetRecordingDates();
            $('#selectedRecordingDates').text('');
        }
    });

    // AP Mode actions
    $('#addAPCourseBtn').on('click', function(e) {
        $('#courseTreeMenuWrap').show();
        $('#courseSearchBox').val('');
        $('#courseTreeMenu > ul > li').show().each(function() {
            if ($(this).data('cat') !== 'AP') $(this).hide();
            else $(this).find('ul').show();
        });
        $(document).off('mousedown.coursemenu').on('mousedown.coursemenu', function(evt) {
            if (!$(evt.target).closest('#courseTreeMenuWrap,#courseSelectorBtn').length) $('#courseTreeMenuWrap').hide();
        });
        e.stopPropagation();
    });

    $('#APCourseItemsContainer').on('click', '.remove-btn', function() {
        const id = $(this).data('id');
        removeAPCourse(id);
        $(`.ap-course-item[data-id="${id}"]`).remove();
        if (state.selectedAPCourses.length === 0) {
            renderSingleCourseOptions(null);
        }
    });

    $('#APCourseItemsContainer').on('change', '.ap-duration-select, .ap-session-select, input[name^="apTimeSlot-"]', function() {
        const id = $(this).data('id');
        const duration = parseInt($(`.ap-duration-select[data-id="${id}"]`).val());
        const session = $(`.ap-session-select[data-id="${id}"]`).val();
        const timeSlot = session === '3' ? $(`input[name="apTimeSlot-${id}"]:checked`).val() : `${session}차`;
        const course = updateAPCourse(id, { duration, session, timeSlot });

        if ($(`.ap-recording-toggle-input[data-id="${id}"]`).is(':checked')) {
            resetAPRecordingDates(id);
            setupAPRecordingCalendar(id);
        }
        if ($(this).hasClass('ap-session-select')) {
            updateAPTimeSlotUI(id, session);
        }
    });

    $('#APCourseItemsContainer').on('change', '.ap-recording-toggle-input', function() {
        const id = $(this).data('id');
        const calendar = $(`.ap-recording-calendar[data-id="${id}"]`);
        if ($(this).is(':checked')) {
            calendar.show();
            setupAPRecordingCalendar(id);
        } else {
            calendar.hide();
            resetAPRecordingDates(id);
            $(`#apRecordingDates-${id}`).text('');
        }
    });

    // Main action buttons
    $('button[onclick="calculateTuition()"]').on('click', function() {
        // Update state from UI just before calculating
        updateState({
            studentName: $('#studentName').val().trim(),
            duration: parseInt($('#duration').val()),
            courseType: $('input[name="courseType"]:checked').val(),
            drwLevel: $('#drwLevel').val()
        });
        const results = calculateTuition();
        renderCalculationResults(results);
    });

    $('#copyButton').on('click', function() {
        const textToCopy = getClipboardText();
        if (textToCopy) {
            navigator.clipboard.writeText(textToCopy)
                .then(() => showToast('예약 안내가 복사되었습니다.'))
                .catch(() => showToast('복사 실패!'));
        }
    });
}

function setupSingleRecordingCalendar() {
    const getSelectableDates = () => {
        const startDate = new Date(state.startDate);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + (state.duration * 7) - 1);
        let dates = [];
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            if (currentDate.getDay() >= 1 && currentDate.getDay() <= 5) { // Mon-Fri
                dates.push($.datepicker.formatDate('yy-mm-dd', currentDate));
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return dates;
    };
    initRecordingCalendar('#recordingCalendar', getSelectableDates, toggleRecordingDate, () => state.selectedRecordingDates, '#selectedRecordingDates');
}

function setupAPRecordingCalendar(courseId) {
    const course = state.selectedAPCourses.find(c => c.id === courseId);
    if (!course) return;

    const getSelectableDates = () => {
        const sessionStartDate = new Date(apSessionInfo[course.session].start);
        const endDate = new Date(sessionStartDate);
        endDate.setDate(sessionStartDate.getDate() + (course.duration * 7) - 1);
        let dates = [];
        let currentDate = new Date(sessionStartDate);
        while (currentDate <= endDate) {
            if (currentDate.getDay() >= 1 && currentDate.getDay() <= 5) { // Mon-Fri
                dates.push($.datepicker.formatDate('yy-mm-dd', currentDate));
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return dates;
    };
    initRecordingCalendar(`#apRecordingCalendar-${courseId}`, getSelectableDates, (date) => toggleAPRecordingDate(courseId, date), () => course.recordingDates, `#apRecordingDates-${courseId}`);
}
