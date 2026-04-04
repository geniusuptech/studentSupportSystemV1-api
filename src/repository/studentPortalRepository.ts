import databaseService from '../config/database';

export class StudentPortalRepository {

    // ==================== DASHBOARD ====================
    
    async getStudentDashboard(studentId: string | number): Promise<any> {
        const profileQuery = `
            SELECT s.*, u.UniversityName, p.ProgramName
            FROM Students s
            JOIN Universities u ON s.UniversityID = u.UniversityID
            JOIN Programs p ON s.ProgramID = p.ProgramID
            WHERE s.StudentID = @studentId AND s.IsActive = 1
        `;
        const coursesCountQuery = `SELECT COUNT(*) as count FROM StudentCourses WHERE StudentID = @studentId AND Status = 'In Progress'`;
        const assignmentsDueQuery = `
            SELECT COUNT(*) as count FROM StudentAssignments 
            WHERE StudentID = @studentId AND Status IN ('Pending', 'Late') AND DueDate >= date('now')
        `;
        const supportRequestsQuery = `
            SELECT COUNT(*) as count FROM SupportRequests 
            WHERE StudentID = @studentId AND Status IN ('Open', 'In Progress')
        `;
        const unreadMessagesQuery = `
            SELECT COUNT(*) as count FROM Messages 
            WHERE RecipientID = @studentId AND RecipientType = 'student' AND IsRead = 0
        `;
        const unreadNotificationsQuery = `
            SELECT COUNT(*) as count FROM Notifications 
            WHERE UserID = @studentId AND UserType = 'student' AND IsRead = 0
        `;
        const recentGradesQuery = `
            SELECT CourseName, CourseCode, Grade, GradePoints, Semester 
            FROM StudentCourses 
            WHERE StudentID = @studentId AND Grade IS NOT NULL
            ORDER BY Year DESC, Semester DESC
            LIMIT 5
        `;
        const upcomingAssignmentsQuery = `
            SELECT a.*, sc.CourseName, sc.CourseCode
            FROM StudentAssignments a
            LEFT JOIN StudentCourses sc ON a.CourseID = sc.CourseID
            WHERE a.StudentID = @studentId AND a.Status IN ('Pending', 'Late')
            ORDER BY a.DueDate ASC
            LIMIT 5
        `;

        const [profile, coursesCount, assignmentsDue, supportRequests, unreadMessages, unreadNotifications, recentGrades, upcomingAssignments] = await Promise.all([
            databaseService.executeQuery(profileQuery, { studentId }),
            databaseService.executeQuery(coursesCountQuery, { studentId }),
            databaseService.executeQuery(assignmentsDueQuery, { studentId }),
            databaseService.executeQuery(supportRequestsQuery, { studentId }),
            databaseService.executeQuery(unreadMessagesQuery, { studentId }),
            databaseService.executeQuery(unreadNotificationsQuery, { studentId }),
            databaseService.executeQuery(recentGradesQuery, { studentId }),
            databaseService.executeQuery(upcomingAssignmentsQuery, { studentId })
        ]);

        if (profile.length === 0) throw new Error('Student not found');
        const s = profile[0];

        return {
            student: {
                id: s.StudentID,
                name: s.StudentName,
                studentNumber: s.StudentNumber,
                email: s.ContactEmail,
                university: s.UniversityName,
                program: s.ProgramName,
                year: s.YearOfStudy,
                gpa: parseFloat(s.GPA) || 0,
                riskLevel: s.RiskLevel
            },
            summary: {
                activeCourses: coursesCount[0]?.count || 0,
                assignmentsDue: assignmentsDue[0]?.count || 0,
                openSupportRequests: supportRequests[0]?.count || 0,
                unreadMessages: unreadMessages[0]?.count || 0,
                unreadNotifications: unreadNotifications[0]?.count || 0
            },
            recentGrades,
            upcomingAssignments
        };
    }

    // ==================== PROFILE ====================
    
    async getStudentProfile(studentId: string | number): Promise<any> {
        const query = `
            SELECT s.*, u.UniversityName, u.UniversityCode, p.ProgramName, p.ProgramCode, p.Department,
                   sp.Bio, sp.Interests, sp.Goals, sp.Achievements, sp.PreferredContactMethod, sp.ProfilePictureURL, sp.IsPublic
            FROM Students s
            JOIN Universities u ON s.UniversityID = u.UniversityID  
            JOIN Programs p ON s.ProgramID = p.ProgramID
            LEFT JOIN StudentProfiles sp ON s.StudentID = sp.StudentID
            WHERE s.StudentID = @studentId AND s.IsActive = 1
        `;
        const data = await databaseService.executeQuery(query, { studentId });
        if (data.length === 0) throw new Error('Student not found');
        
        const s = data[0];
        return {
            id: s.StudentID,
            name: s.StudentName,
            studentNumber: s.StudentNumber,
            email: s.ContactEmail,
            phone: s.ContactPhone,
            emergencyContact: s.EmergencyContact,
            emergencyPhone: s.EmergencyPhone,
            university: { id: s.UniversityID, name: s.UniversityName, code: s.UniversityCode },
            program: { id: s.ProgramID, name: s.ProgramName, code: s.ProgramCode, department: s.Department },
            yearOfStudy: s.YearOfStudy,
            gpa: parseFloat(s.GPA) || 0,
            riskLevel: s.RiskLevel,
            dateEnrolled: s.DateEnrolled,
            lastLoginDate: s.LastLoginDate,
            bio: s.Bio || '',
            interests: s.Interests || '',
            goals: s.Goals || '',
            achievements: s.Achievements || '',
            preferredContactMethod: s.PreferredContactMethod || 'Email',
            profilePictureUrl: s.ProfilePictureURL || null,
            isPublic: s.IsPublic === 1
        };
    }

    async updateStudentProfile(studentId: string | number, data: any): Promise<any> {
        // Update Students table fields
        const studentFields: string[] = [];
        const studentParams: any = { studentId };
        
        if (data.name !== undefined) { studentFields.push('StudentName = @name'); studentParams.name = data.name; }
        if (data.phone !== undefined) { studentFields.push('ContactPhone = @phone'); studentParams.phone = data.phone; }
        if (data.emergencyContact !== undefined) { studentFields.push('EmergencyContact = @emergencyContact'); studentParams.emergencyContact = data.emergencyContact; }
        if (data.emergencyPhone !== undefined) { studentFields.push('EmergencyPhone = @emergencyPhone'); studentParams.emergencyPhone = data.emergencyPhone; }

        if (studentFields.length > 0) {
            studentFields.push('UpdatedAt = CURRENT_TIMESTAMP');
            const query = `UPDATE Students SET ${studentFields.join(', ')} WHERE StudentID = @studentId`;
            await databaseService.executeQuery(query, studentParams);
        }

        // Upsert StudentProfiles
        const profileData = {
            bio: data.bio,
            interests: data.interests,
            goals: data.goals,
            achievements: data.achievements,
            preferredContactMethod: data.preferredContactMethod,
            isPublic: data.isPublic
        };
        
        const hasProfileData = Object.values(profileData).some(v => v !== undefined);
        if (hasProfileData) {
            // Check if profile exists
            const existing = await databaseService.executeQuery(
                `SELECT ProfileID FROM StudentProfiles WHERE StudentID = @studentId`, { studentId }
            );
            
            if (existing.length > 0) {
                const fields: string[] = [];
                const params: any = { studentId };
                if (data.bio !== undefined) { fields.push('Bio = @bio'); params.bio = data.bio; }
                if (data.interests !== undefined) { fields.push('Interests = @interests'); params.interests = data.interests; }
                if (data.goals !== undefined) { fields.push('Goals = @goals'); params.goals = data.goals; }
                if (data.achievements !== undefined) { fields.push('Achievements = @achievements'); params.achievements = data.achievements; }
                if (data.preferredContactMethod !== undefined) { fields.push('PreferredContactMethod = @preferredContactMethod'); params.preferredContactMethod = data.preferredContactMethod; }
                if (data.isPublic !== undefined) { fields.push('IsPublic = @isPublic'); params.isPublic = data.isPublic ? 1 : 0; }
                fields.push('UpdatedAt = CURRENT_TIMESTAMP');
                await databaseService.executeQuery(`UPDATE StudentProfiles SET ${fields.join(', ')} WHERE StudentID = @studentId`, params);
            } else {
                await databaseService.executeQuery(`
                    INSERT INTO StudentProfiles (StudentID, Bio, Interests, Goals, Achievements, PreferredContactMethod, IsPublic, CreatedAt, UpdatedAt)
                    VALUES (@studentId, @bio, @interests, @goals, @achievements, @preferredContactMethod, @isPublic, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                `, {
                    studentId,
                    bio: data.bio || '',
                    interests: data.interests || '',
                    goals: data.goals || '',
                    achievements: data.achievements || '',
                    preferredContactMethod: data.preferredContactMethod || 'Email',
                    isPublic: data.isPublic ? 1 : 0
                });
            }
        }

        return this.getStudentProfile(studentId);
    }

    // ==================== COURSES ====================
    
    async getStudentCourses(studentId: string | number, filters: any = {}): Promise<any[]> {
        let query = `
            SELECT * FROM StudentCourses 
            WHERE StudentID = @studentId
        `;
        const params: any = { studentId };

        if (filters.status) {
            query += ` AND Status = @status`;
            params.status = filters.status;
        }
        if (filters.semester) {
            query += ` AND Semester = @semester`;
            params.semester = filters.semester;
        }
        if (filters.year) {
            query += ` AND Year = @year`;
            params.year = parseInt(filters.year);
        }

        query += ` ORDER BY Year DESC, Semester DESC, CourseName ASC`;
        return databaseService.executeQuery(query, params);
    }

    async getCourseSummary(studentId: string | number): Promise<any> {
        const totalQuery = `SELECT COUNT(*) as total FROM StudentCourses WHERE StudentID = @studentId`;
        const inProgressQuery = `SELECT COUNT(*) as count FROM StudentCourses WHERE StudentID = @studentId AND Status = 'In Progress'`;
        const completedQuery = `SELECT COUNT(*) as count FROM StudentCourses WHERE StudentID = @studentId AND Status = 'Completed'`;
        const avgGradeQuery = `SELECT AVG(GradePoints) as avg FROM StudentCourses WHERE StudentID = @studentId AND GradePoints IS NOT NULL`;
        const totalCreditsQuery = `SELECT SUM(Credits) as total FROM StudentCourses WHERE StudentID = @studentId AND Status = 'Completed'`;

        const [total, inProgress, completed, avgGrade, totalCredits] = await Promise.all([
            databaseService.executeQuery(totalQuery, { studentId }),
            databaseService.executeQuery(inProgressQuery, { studentId }),
            databaseService.executeQuery(completedQuery, { studentId }),
            databaseService.executeQuery(avgGradeQuery, { studentId }),
            databaseService.executeQuery(totalCreditsQuery, { studentId })
        ]);

        return {
            totalCourses: total[0]?.total || 0,
            inProgress: inProgress[0]?.count || 0,
            completed: completed[0]?.count || 0,
            averageGrade: Math.round((avgGrade[0]?.avg || 0) * 100) / 100,
            totalCredits: totalCredits[0]?.total || 0
        };
    }

    // ==================== ASSIGNMENTS ====================
    
    async getStudentAssignments(studentId: string | number, filters: any = {}): Promise<any[]> {
        let query = `
            SELECT a.*, sc.CourseName, sc.CourseCode
            FROM StudentAssignments a
            LEFT JOIN StudentCourses sc ON a.CourseID = sc.CourseID
            WHERE a.StudentID = @studentId
        `;
        const params: any = { studentId };

        if (filters.status) {
            query += ` AND a.Status = @status`;
            params.status = filters.status;
        }
        if (filters.courseId) {
            query += ` AND a.CourseID = @courseId`;
            params.courseId = filters.courseId;
        }
        if (filters.upcoming === 'true') {
            query += ` AND a.DueDate >= date('now') AND a.Status IN ('Pending', 'Late')`;
        }
        if (filters.overdue === 'true') {
            query += ` AND a.DueDate < date('now') AND a.Status IN ('Pending', 'Late')`;
        }

        query += ` ORDER BY a.DueDate ASC`;
        return databaseService.executeQuery(query, params);
    }

    async getAssignmentSummary(studentId: string | number): Promise<any> {
        const totalQuery = `SELECT COUNT(*) as total FROM StudentAssignments WHERE StudentID = @studentId`;
        const pendingQuery = `SELECT COUNT(*) as count FROM StudentAssignments WHERE StudentID = @studentId AND Status = 'Pending'`;
        const submittedQuery = `SELECT COUNT(*) as count FROM StudentAssignments WHERE StudentID = @studentId AND Status = 'Submitted'`;
        const gradedQuery = `SELECT COUNT(*) as count FROM StudentAssignments WHERE StudentID = @studentId AND Status = 'Graded'`;
        const lateQuery = `SELECT COUNT(*) as count FROM StudentAssignments WHERE StudentID = @studentId AND Status = 'Late'`;
        const missingQuery = `SELECT COUNT(*) as count FROM StudentAssignments WHERE StudentID = @studentId AND Status = 'Missing'`;
        const avgGradeQuery = `SELECT AVG(Grade * 100.0 / MaxGrade) as avg FROM StudentAssignments WHERE StudentID = @studentId AND Grade IS NOT NULL`;

        const [total, pending, submitted, graded, late, missing, avgGrade] = await Promise.all([
            databaseService.executeQuery(totalQuery, { studentId }),
            databaseService.executeQuery(pendingQuery, { studentId }),
            databaseService.executeQuery(submittedQuery, { studentId }),
            databaseService.executeQuery(gradedQuery, { studentId }),
            databaseService.executeQuery(lateQuery, { studentId }),
            databaseService.executeQuery(missingQuery, { studentId }),
            databaseService.executeQuery(avgGradeQuery, { studentId })
        ]);

        return {
            total: total[0]?.total || 0,
            pending: pending[0]?.count || 0,
            submitted: submitted[0]?.count || 0,
            graded: graded[0]?.count || 0,
            late: late[0]?.count || 0,
            missing: missing[0]?.count || 0,
            averageScore: Math.round((avgGrade[0]?.avg || 0) * 100) / 100
        };
    }

    // ==================== GRADES ====================
    
    async getStudentGrades(studentId: string | number): Promise<any> {
        const coursesQuery = `
            SELECT CourseID, CourseName, CourseCode, Credits, Grade, GradePoints, Semester, Year, Status
            FROM StudentCourses 
            WHERE StudentID = @studentId AND (Grade IS NOT NULL OR Status = 'In Progress')
            ORDER BY Year DESC, Semester DESC, CourseName ASC
        `;
        const assignmentsQuery = `
            SELECT a.AssignmentID, a.Title, a.Grade, a.MaxGrade, a.Status, a.CourseID,
                   sc.CourseName, sc.CourseCode,
                   CASE WHEN a.MaxGrade > 0 THEN ROUND(a.Grade * 100.0 / a.MaxGrade, 1) ELSE 0 END as percentage
            FROM StudentAssignments a
            LEFT JOIN StudentCourses sc ON a.CourseID = sc.CourseID
            WHERE a.StudentID = @studentId AND a.Grade IS NOT NULL
            ORDER BY a.CreatedAt DESC
        `;
        const gpaQuery = `SELECT GPA FROM Students WHERE StudentID = @studentId`;

        const [courses, assignments, gpa] = await Promise.all([
            databaseService.executeQuery(coursesQuery, { studentId }),
            databaseService.executeQuery(assignmentsQuery, { studentId }),
            databaseService.executeQuery(gpaQuery, { studentId })
        ]);

        return {
            currentGPA: parseFloat(gpa[0]?.GPA) || 0,
            courses,
            assignments
        };
    }

    // ==================== SUPPORT REQUESTS ====================
    
    async getStudentSupportRequests(studentId: string | number, filters: any = {}): Promise<any[]> {
        let query = `
            SELECT sr.*, sc.CategoryName, p.PartnerName, p.PartnerType
            FROM SupportRequests sr
            LEFT JOIN SupportRequestCategories sc ON sr.CategoryID = sc.CategoryID
            LEFT JOIN Partners p ON sr.AssignedPartnerID = p.PartnerID
            WHERE sr.StudentID = @studentId
        `;
        const params: any = { studentId };

        if (filters.status) {
            query += ` AND sr.Status = @status`;
            params.status = filters.status;
        }

        query += ` ORDER BY sr.CreatedAt DESC`;
        return databaseService.executeQuery(query, params);
    }

    async createStudentSupportRequest(studentId: string | number, data: any): Promise<any> {
        const query = `
            INSERT INTO SupportRequests (StudentID, CategoryID, Title, Description, Priority, Status, CreatedAt, UpdatedAt)
            VALUES (@studentId, @categoryId, @title, @description, @priority, 'Open', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING *
        `;
        const params = {
            studentId,
            categoryId: data.categoryId || 1,
            title: data.title,
            description: data.description,
            priority: data.priority || 'Medium'
        };
        const result = await databaseService.executeQuery(query, params);
        return result[0];
    }

    async getSupportCategories(): Promise<any[]> {
        const query = `SELECT * FROM SupportRequestCategories WHERE IsActive = 1 ORDER BY CategoryName`;
        return databaseService.executeQuery(query);
    }

    // ==================== WELLNESS ====================
    
    async getStudentWellness(studentId: string | number): Promise<any> {
        // Latest metrics
        const metricsQuery = `
            SELECT * FROM StudentMetrics 
            WHERE StudentID = @studentId 
            ORDER BY RecordedAt DESC LIMIT 1
        `;
        // Wellness check-ins history
        const checkinsQuery = `
            SELECT * FROM StudentWellnessCheckins 
            WHERE StudentID = @studentId 
            ORDER BY CreatedAt DESC 
            LIMIT 30
        `;
        // Risk level
        const riskQuery = `SELECT RiskLevel, GPA FROM Students WHERE StudentID = @studentId`;
        // Support requests count
        const supportQuery = `SELECT COUNT(*) as count FROM SupportRequests WHERE StudentID = @studentId`;

        const [metrics, checkins, risk, support] = await Promise.all([
            databaseService.executeQuery(metricsQuery, { studentId }),
            databaseService.executeQuery(checkinsQuery, { studentId }),
            databaseService.executeQuery(riskQuery, { studentId }),
            databaseService.executeQuery(supportQuery, { studentId })
        ]);

        return {
            currentMetrics: metrics[0] || {
                AttendanceRate: 0,
                AssignmentCompletion: 0,
                AverageGrade: 0,
                WellnessScore: 0,
                SupportRequestsCount: support[0]?.count || 0
            },
            riskLevel: risk[0]?.RiskLevel || 'Safe',
            gpa: parseFloat(risk[0]?.GPA) || 0,
            checkins,
            totalSupportRequests: support[0]?.count || 0
        };
    }

    async createWellnessCheckin(studentId: string | number, data: any): Promise<any> {
        const query = `
            INSERT INTO StudentWellnessCheckins (StudentID, MoodScore, StressLevel, SleepHours, ExerciseMinutes, Notes, CreatedAt)
            VALUES (@studentId, @moodScore, @stressLevel, @sleepHours, @exerciseMinutes, @notes, CURRENT_TIMESTAMP)
            RETURNING *
        `;
        const params = {
            studentId,
            moodScore: data.moodScore || null,
            stressLevel: data.stressLevel || null,
            sleepHours: data.sleepHours || null,
            exerciseMinutes: data.exerciseMinutes || 0,
            notes: data.notes || null
        };
        const result = await databaseService.executeQuery(query, params);
        return result[0];
    }

    // ==================== SCHEDULE ====================
    
    async getStudentSchedule(studentId: string | number, filters: any = {}): Promise<any[]> {
        let query = `
            SELECT ss.*, sc.CourseName, sc.CourseCode
            FROM StudentSchedule ss
            LEFT JOIN StudentCourses sc ON ss.CourseID = sc.CourseID
            WHERE ss.StudentID = @studentId
        `;
        const params: any = { studentId };

        if (filters.dayOfWeek) {
            query += ` AND ss.DayOfWeek = @dayOfWeek`;
            params.dayOfWeek = filters.dayOfWeek;
        }
        if (filters.type) {
            query += ` AND ss.Type = @type`;
            params.type = filters.type;
        }

        query += ` ORDER BY CASE ss.DayOfWeek 
            WHEN 'Monday' THEN 1 WHEN 'Tuesday' THEN 2 WHEN 'Wednesday' THEN 3 
            WHEN 'Thursday' THEN 4 WHEN 'Friday' THEN 5 WHEN 'Saturday' THEN 6 WHEN 'Sunday' THEN 7 
        END, ss.StartTime ASC`;

        return databaseService.executeQuery(query, params);
    }

    async addScheduleItem(studentId: string | number, data: any): Promise<any> {
        const query = `
            INSERT INTO StudentSchedule (StudentID, CourseID, Title, Description, DayOfWeek, StartTime, EndTime, Location, Instructor, Type, IsRecurring, EventDate, Semester, CreatedAt)
            VALUES (@studentId, @courseId, @title, @description, @dayOfWeek, @startTime, @endTime, @location, @instructor, @type, @isRecurring, @eventDate, @semester, CURRENT_TIMESTAMP)
            RETURNING *
        `;
        const params = {
            studentId,
            courseId: data.courseId || null,
            title: data.title,
            description: data.description || null,
            dayOfWeek: data.dayOfWeek,
            startTime: data.startTime,
            endTime: data.endTime,
            location: data.location || null,
            instructor: data.instructor || null,
            type: data.type || 'Lecture',
            isRecurring: data.isRecurring !== undefined ? (data.isRecurring ? 1 : 0) : 1,
            eventDate: data.eventDate || null,
            semester: data.semester || null
        };
        const result = await databaseService.executeQuery(query, params);
        return result[0];
    }

    async deleteScheduleItem(scheduleId: string | number, studentId: string | number): Promise<void> {
        const query = `DELETE FROM StudentSchedule WHERE ScheduleID = @scheduleId AND StudentID = @studentId`;
        await databaseService.executeQuery(query, { scheduleId, studentId });
    }

    // ==================== SETTINGS ====================
    
    async getStudentSettings(studentId: string | number): Promise<any> {
        const query = `SELECT * FROM StudentSettings WHERE StudentID = @studentId`;
        const data = await databaseService.executeQuery(query, { studentId });
        
        if (data.length === 0) {
            // Return defaults
            return {
                theme: 'light',
                language: 'en',
                emailNotifications: true,
                pushNotifications: true,
                smsNotifications: false,
                showProfilePublic: false,
                showGPA: false,
                showCourses: false,
                twoFactorEnabled: false,
                preferredContactMethod: 'Email'
            };
        }

        const s = data[0];
        return {
            theme: s.Theme,
            language: s.Language,
            emailNotifications: s.EmailNotifications === 1,
            pushNotifications: s.PushNotifications === 1,
            smsNotifications: s.SMSNotifications === 1,
            showProfilePublic: s.ShowProfilePublic === 1,
            showGPA: s.ShowGPA === 1,
            showCourses: s.ShowCourses === 1,
            twoFactorEnabled: s.TwoFactorEnabled === 1,
            preferredContactMethod: s.PreferredContactMethod
        };
    }

    async updateStudentSettings(studentId: string | number, data: any): Promise<any> {
        // Check if settings exist
        const existing = await databaseService.executeQuery(
            `SELECT SettingID FROM StudentSettings WHERE StudentID = @studentId`, { studentId }
        );

        if (existing.length > 0) {
            const fields: string[] = [];
            const params: any = { studentId };

            if (data.theme !== undefined) { fields.push('Theme = @theme'); params.theme = data.theme; }
            if (data.language !== undefined) { fields.push('Language = @language'); params.language = data.language; }
            if (data.emailNotifications !== undefined) { fields.push('EmailNotifications = @emailNotifications'); params.emailNotifications = data.emailNotifications ? 1 : 0; }
            if (data.pushNotifications !== undefined) { fields.push('PushNotifications = @pushNotifications'); params.pushNotifications = data.pushNotifications ? 1 : 0; }
            if (data.smsNotifications !== undefined) { fields.push('SMSNotifications = @smsNotifications'); params.smsNotifications = data.smsNotifications ? 1 : 0; }
            if (data.showProfilePublic !== undefined) { fields.push('ShowProfilePublic = @showProfilePublic'); params.showProfilePublic = data.showProfilePublic ? 1 : 0; }
            if (data.showGPA !== undefined) { fields.push('ShowGPA = @showGPA'); params.showGPA = data.showGPA ? 1 : 0; }
            if (data.showCourses !== undefined) { fields.push('ShowCourses = @showCourses'); params.showCourses = data.showCourses ? 1 : 0; }
            if (data.twoFactorEnabled !== undefined) { fields.push('TwoFactorEnabled = @twoFactorEnabled'); params.twoFactorEnabled = data.twoFactorEnabled ? 1 : 0; }
            if (data.preferredContactMethod !== undefined) { fields.push('PreferredContactMethod = @preferredContactMethod'); params.preferredContactMethod = data.preferredContactMethod; }

            if (fields.length > 0) {
                fields.push('UpdatedAt = CURRENT_TIMESTAMP');
                const query = `UPDATE StudentSettings SET ${fields.join(', ')} WHERE StudentID = @studentId`;
                await databaseService.executeQuery(query, params);
            }
        } else {
            // Insert new settings
            const query = `
                INSERT INTO StudentSettings (StudentID, Theme, Language, EmailNotifications, PushNotifications, SMSNotifications, ShowProfilePublic, ShowGPA, ShowCourses, TwoFactorEnabled, PreferredContactMethod, UpdatedAt)
                VALUES (@studentId, @theme, @language, @emailNotifications, @pushNotifications, @smsNotifications, @showProfilePublic, @showGPA, @showCourses, @twoFactorEnabled, @preferredContactMethod, CURRENT_TIMESTAMP)
            `;
            await databaseService.executeQuery(query, {
                studentId,
                theme: data.theme || 'light',
                language: data.language || 'en',
                emailNotifications: data.emailNotifications !== undefined ? (data.emailNotifications ? 1 : 0) : 1,
                pushNotifications: data.pushNotifications !== undefined ? (data.pushNotifications ? 1 : 0) : 1,
                smsNotifications: data.smsNotifications ? 1 : 0,
                showProfilePublic: data.showProfilePublic ? 1 : 0,
                showGPA: data.showGPA ? 1 : 0,
                showCourses: data.showCourses ? 1 : 0,
                twoFactorEnabled: data.twoFactorEnabled ? 1 : 0,
                preferredContactMethod: data.preferredContactMethod || 'Email'
            });
        }

        return this.getStudentSettings(studentId);
    }
}

export const studentPortalRepository = new StudentPortalRepository();
