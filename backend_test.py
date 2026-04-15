#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Job Board Management System
Tests all endpoints with proper authentication and error handling
"""

import requests
import sys
import json
from datetime import datetime
import time

class JobBoardAPITester:
    def __init__(self, base_url="https://career-match-hub-11.preview.emergentagent.com"):
        self.base_url = base_url
        self.admin_token = None
        self.seeker_token = None
        self.recruiter_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_job_id = None
        self.test_application_id = None
        self.test_referral_id = None

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")

    def make_request(self, method, endpoint, data=None, token=None, expected_status=200):
        """Make API request with proper headers"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            return success, response.status_code, response.json() if response.content else {}

        except Exception as e:
            return False, 0, {"error": str(e)}

    def test_auth_endpoints(self):
        """Test authentication endpoints"""
        print("\n🔐 Testing Authentication Endpoints...")
        
        # Test admin login
        success, status, data = self.make_request(
            'POST', 'auth/login', 
            {"email": "admin@jobboard.com", "password": "admin123"}
        )
        if success and 'token' in data:
            self.admin_token = data['token']
            self.log_test("Admin Login", True)
        else:
            self.log_test("Admin Login", False, f"Status: {status}, Data: {data}")

        # Test seeker login
        success, status, data = self.make_request(
            'POST', 'auth/login',
            {"email": "seeker@demo.com", "password": "seeker123"}
        )
        if success and 'token' in data:
            self.seeker_token = data['token']
            self.log_test("Seeker Login", True)
        else:
            self.log_test("Seeker Login", False, f"Status: {status}, Data: {data}")

        # Test recruiter login
        success, status, data = self.make_request(
            'POST', 'auth/login',
            {"email": "recruiter@techcorp.com", "password": "recruiter123"}
        )
        if success and 'token' in data:
            self.recruiter_token = data['token']
            self.log_test("Recruiter Login", True)
        else:
            self.log_test("Recruiter Login", False, f"Status: {status}, Data: {data}")

        # Test invalid login
        success, status, data = self.make_request(
            'POST', 'auth/login',
            {"email": "invalid@test.com", "password": "wrong"},
            expected_status=401
        )
        self.log_test("Invalid Login (401)", success, f"Status: {status}")

        # Test /auth/me with admin token
        if self.admin_token:
            success, status, data = self.make_request(
                'GET', 'auth/me', token=self.admin_token
            )
            self.log_test("Get Current User (Admin)", success and data.get('role') == 'admin')

    def test_job_endpoints(self):
        """Test job-related endpoints"""
        print("\n💼 Testing Job Endpoints...")

        # Test get all jobs (public)
        success, status, data = self.make_request('GET', 'jobs')
        jobs_available = success and 'jobs' in data and len(data['jobs']) > 0
        self.log_test("Get All Jobs", jobs_available)
        
        if jobs_available:
            self.test_job_id = data['jobs'][0]['id']
            print(f"   Using job ID: {self.test_job_id}")

        # Test get specific job
        if self.test_job_id:
            success, status, data = self.make_request('GET', f'jobs/{self.test_job_id}')
            self.log_test("Get Specific Job", success and 'title' in data)

        # Test job search with filters
        success, status, data = self.make_request('GET', 'jobs?search=developer&location=remote')
        self.log_test("Job Search with Filters", success and 'jobs' in data)

        # Test create job (recruiter only)
        if self.recruiter_token:
            job_data = {
                "title": "Test Job Position",
                "company": "Test Company",
                "location": "Test Location",
                "salary_min": 50000,
                "salary_max": 80000,
                "description": "Test job description",
                "requirements": ["Test requirement"],
                "skills_required": ["Python", "Testing"],
                "job_type": "full-time",
                "experience_level": "mid"
            }
            success, status, data = self.make_request(
                'POST', 'jobs', job_data, self.recruiter_token, 200
            )
            if success and 'id' in data:
                created_job_id = data['id']
                self.log_test("Create Job (Recruiter)", True)
                
                # Test update job
                update_data = {"title": "Updated Test Job Position"}
                success, status, data = self.make_request(
                    'PUT', f'jobs/{created_job_id}', update_data, self.recruiter_token
                )
                self.log_test("Update Job (Recruiter)", success)
                
                # Test delete job
                success, status, data = self.make_request(
                    'DELETE', f'jobs/{created_job_id}', token=self.recruiter_token
                )
                self.log_test("Delete Job (Recruiter)", success)
            else:
                self.log_test("Create Job (Recruiter)", False, f"Status: {status}, Data: {data}")

        # Test unauthorized job creation (seeker)
        if self.seeker_token:
            job_data = {
                "title": "Unauthorized Job", 
                "company": "Test",
                "location": "Test Location",
                "description": "Test description"
            }
            success, status, data = self.make_request(
                'POST', 'jobs', job_data, self.seeker_token, 403
            )
            self.log_test("Unauthorized Job Creation (403)", success)

    def test_application_endpoints(self):
        """Test application-related endpoints"""
        print("\n📝 Testing Application Endpoints...")

        if not self.seeker_token or not self.test_job_id:
            print("   Skipping application tests - missing seeker token or job ID")
            return

        # Test apply to job
        app_data = {
            "job_id": self.test_job_id,
            "cover_letter": "This is a test cover letter for the application."
        }
        success, status, data = self.make_request(
            'POST', 'applications', app_data, self.seeker_token, 200
        )
        if success and 'id' in data:
            self.test_application_id = data['id']
            self.log_test("Apply to Job", True)
            print(f"   Application ID: {self.test_application_id}")
        else:
            self.log_test("Apply to Job", False, f"Status: {status}, Data: {data}")

        # Test get my applications
        success, status, data = self.make_request(
            'GET', 'applications/mine', token=self.seeker_token
        )
        self.log_test("Get My Applications", success and isinstance(data, list))

        # Test duplicate application (should fail)
        success, status, data = self.make_request(
            'POST', 'applications', app_data, self.seeker_token, 400
        )
        self.log_test("Duplicate Application (400)", success)

        # Test get job applications (recruiter)
        if self.recruiter_token and self.test_job_id:
            success, status, data = self.make_request(
                'GET', f'applications/job/{self.test_job_id}', token=self.recruiter_token
            )
            self.log_test("Get Job Applications (Recruiter)", success and isinstance(data, list))

    def test_analytics_endpoints(self):
        """Test analytics endpoints"""
        print("\n📊 Testing Analytics Endpoints...")

        # Test seeker analytics
        if self.seeker_token:
            success, status, data = self.make_request(
                'GET', 'analytics/seeker', token=self.seeker_token
            )
            self.log_test("Seeker Analytics", success and 'total_applications' in data)

        # Test recruiter analytics
        if self.recruiter_token:
            success, status, data = self.make_request(
                'GET', 'analytics/recruiter', token=self.recruiter_token
            )
            self.log_test("Recruiter Analytics", success and 'total_jobs' in data)

        # Test admin analytics
        if self.admin_token:
            success, status, data = self.make_request(
                'GET', 'analytics/admin', token=self.admin_token
            )
            self.log_test("Admin Analytics", success and 'total_users' in data)

    def test_skill_gap_analyzer(self):
        """Test AI skill gap analyzer"""
        print("\n🧠 Testing Skill Gap Analyzer...")

        if not self.seeker_token or not self.test_job_id:
            print("   Skipping skill gap tests - missing seeker token or job ID")
            return

        skill_data = {"job_id": self.test_job_id}
        success, status, data = self.make_request(
            'POST', 'skills/analyze', skill_data, self.seeker_token
        )
        
        if success and 'score' in data:
            self.log_test("Skill Gap Analysis", True)
            print(f"   Match Score: {data.get('score', 0)}%")
            print(f"   Matching Skills: {len(data.get('matching_skills', []))}")
            print(f"   Missing Skills: {len(data.get('missing_skills', []))}")
        else:
            self.log_test("Skill Gap Analysis", False, f"Status: {status}, Data: {data}")

    def test_smart_recommendations(self):
        """Test smart job recommendations"""
        print("\n🎯 Testing Smart Recommendations...")

        if not self.seeker_token:
            print("   Skipping recommendations - missing seeker token")
            return

        success, status, data = self.make_request(
            'GET', 'jobs/recommendations/smart', token=self.seeker_token
        )
        
        if success and isinstance(data, list):
            self.log_test("Smart Job Recommendations", True)
            print(f"   Recommended Jobs: {len(data)}")
            if data:
                print(f"   Top Match Score: {data[0].get('match_score', 0)}%")
        else:
            self.log_test("Smart Job Recommendations", False, f"Status: {status}")

    def test_referral_endpoints(self):
        """Test referral system"""
        print("\n🤝 Testing Referral System...")

        if not self.seeker_token:
            print("   Skipping referral tests - missing seeker token")
            return

        # Test create referral
        referral_data = {
            "referred_email": "friend@example.com",
            "referred_name": "Test Friend",
            "job_id": self.test_job_id,
            "message": "Check out this great opportunity!"
        }
        success, status, data = self.make_request(
            'POST', 'referrals', referral_data, self.seeker_token, 200
        )
        
        if success and 'id' in data:
            self.test_referral_id = data['id']
            self.log_test("Create Referral", True)
        else:
            self.log_test("Create Referral", False, f"Status: {status}, Data: {data}")

        # Test get my referrals
        success, status, data = self.make_request(
            'GET', 'referrals/mine', token=self.seeker_token
        )
        self.log_test("Get My Referrals", success and isinstance(data, list))

    def test_profile_endpoints(self):
        """Test profile management"""
        print("\n👤 Testing Profile Endpoints...")

        if not self.seeker_token:
            print("   Skipping profile tests - missing seeker token")
            return

        # Test get profile
        success, status, data = self.make_request(
            'GET', 'profile', token=self.seeker_token
        )
        self.log_test("Get Profile", success and 'email' in data)

        # Test update profile
        profile_data = {
            "bio": "Updated bio for testing",
            "experience": "3 years",
            "skills": ["Python", "React", "Testing", "API Development"]
        }
        success, status, data = self.make_request(
            'PUT', 'profile', profile_data, self.seeker_token
        )
        self.log_test("Update Profile", success and data.get('bio') == profile_data['bio'])

    def test_admin_endpoints(self):
        """Test admin-only endpoints"""
        print("\n👑 Testing Admin Endpoints...")

        if not self.admin_token:
            print("   Skipping admin tests - missing admin token")
            return

        # Test get all users
        success, status, data = self.make_request(
            'GET', 'admin/users', token=self.admin_token
        )
        self.log_test("Get All Users (Admin)", success and isinstance(data, list))

        # Test get all jobs (admin)
        success, status, data = self.make_request(
            'GET', 'admin/jobs', token=self.admin_token
        )
        self.log_test("Get All Jobs (Admin)", success and isinstance(data, list))

        # Test unauthorized access (seeker trying admin endpoint)
        if self.seeker_token:
            success, status, data = self.make_request(
                'GET', 'admin/users', token=self.seeker_token, expected_status=403
            )
            self.log_test("Unauthorized Admin Access (403)", success)

    def run_all_tests(self):
        """Run comprehensive test suite"""
        print("🚀 Starting Job Board API Test Suite")
        print(f"Testing against: {self.base_url}")
        print("=" * 60)

        start_time = time.time()

        # Run all test categories
        self.test_auth_endpoints()
        self.test_job_endpoints()
        self.test_application_endpoints()
        self.test_analytics_endpoints()
        self.test_skill_gap_analyzer()
        self.test_smart_recommendations()
        self.test_referral_endpoints()
        self.test_profile_endpoints()
        self.test_admin_endpoints()

        # Print summary
        end_time = time.time()
        duration = round(end_time - start_time, 2)
        
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {round((self.tests_passed / self.tests_run) * 100, 1)}%")
        print(f"Duration: {duration}s")
        
        if self.tests_passed == self.tests_run:
            print("🎉 ALL TESTS PASSED!")
            return 0
        else:
            print("⚠️  SOME TESTS FAILED")
            return 1

def main():
    """Main test runner"""
    tester = JobBoardAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())