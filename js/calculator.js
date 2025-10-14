// refactored/js/calculator.js

// 수강료 계산과 관련된 모든 순수 로직을 담당합니다.

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

    let courseType = state.courseType;
    
    if (typeof timeTable[c.name] === 'object') {
      timeStr = timeTable[c.name][courseType] + " (한국시간)";
    } else {
      timeStr = timeTable[c.name] + " (한국시간)";
    }
  }
  
  return { durationStr, timeStr, totalFee };
}

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

function calculateTuition() {
  const { studentName, courseKey, isAPMode, selectedAPCourses, discount, startDate, duration, courseType, drwLevel, selectedRecordingDates } = state;
  const c = courseInfo[courseKey];

  if (!studentName) return { error: '이름을 입력하세요.' };
  if (!courseKey || !c) return { error: '과목을 선택하세요.' };

  let finalResults = { allCourseDetails: [], totalFee: 0, isAPMultiselectMode: isAPMode };

  if (isAPMode) {
    if (selectedAPCourses.length === 0) {
      return { error: 'AP 과목을 하나 이상 선택하고 옵션을 설정하세요.' };
    }

    let timeIdentifiers = [];
    for (const courseItem of selectedAPCourses) {
      const cInfo = courseInfo[courseItem.key];
      const details = getCourseDetails(courseItem.key, courseItem.duration, courseItem.session, courseItem.timeSlot);
      
      const recordingDays = courseItem.recordingDates.length;
      const totalDays = courseItem.duration * 5; 
      
      if (recordingDays > 0 && recordingDays >= totalDays) {
        return { error: `${cInfo.name}: 최소 1일은 실시간 수업으로 진행되어야 합니다.` };
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

      let currentInfo = {
        session: courseItem.session,
        time: details.rawTimeStr,
        days: (cInfo.days || []).map(Number)
      };

      for (const existing of timeIdentifiers) {
        if (existing.session === currentInfo.session && existing.time === currentInfo.time && existing.days.some(day => currentInfo.days.includes(day))) {
          return { error: '선택한 AP 과목 중 동일한 차수/시간대에 겹치는 수업이 있습니다!' };
        }
      }
      timeIdentifiers.push(currentInfo);

      finalResults.allCourseDetails.push({
        name: cInfo.name,
        duration: details.durationStr,
        recordingDates: courseItem.recordingDates,
        time: details.timeStr,
        totalFee: finalFee,
        normalFee,
        recordingFee,
        hasRecording,
        totalDays,
        discount
      });
      finalResults.totalFee += finalFee;
    }
  } else {
    // 단일 과목 모드
    if (!startDate) return { error: '수강 시작일을 입력하세요.' };
    
    if ((['sat_1500', 'sat_1400', 'sat_bridge', 'toefl_l1', 'toefl_l2', 'dm_alg2'].includes(courseKey) && !courseType) || 
        (['drw_morning', 'drw_a', 'drw_b'].includes(courseKey) && !drwLevel)) {
      return { error: '수업 형태 또는 레벨을 선택하세요.' };
    }

    const recordingDays = selectedRecordingDates.length;
    const totalDays = duration * 5; // 주 5일 기준

    if (recordingDays > 0 && recordingDays >= totalDays) {
      return { error: '최소 1일은 실시간 수업으로 진행되어야 합니다.' };
    }

    let displayCourseName = c.name;
    if (['drw_morning', 'drw_a', 'drw_b'].includes(courseKey)) {
      displayCourseName = `겨울특강 DRW ${drwLevel}${courseKey.endsWith('a') ? 'A' : courseKey.endsWith('b') ? 'B' : ' 오전'}`;
    }
    if (courseKey === 'toefl_awesome') displayCourseName += ' ' + duration + 'set';
    if (['sat_1500', 'sat_1400', 'sat_bridge', 'toefl_l1', 'toefl_l2', 'dm_alg2'].includes(courseKey)) displayCourseName += ' ' + courseType;

    const details = getCourseDetails(courseKey, duration, null, null, startDate);
    
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

    finalResults.allCourseDetails.push({
        name: displayCourseName,
        duration: details.durationStr,
        recordingDates: selectedRecordingDates,
        time: details.timeStr,
        totalFee: finalFee,
        normalFee,
        recordingFee,
        hasRecording,
        totalDays,
        isAP: c.isAP,
        discount
    });
    finalResults.totalFee = finalFee;
  }

  return finalResults;
}
