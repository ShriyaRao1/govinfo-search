-- ============================================================
--  GovInfo Search — Seed Data
--  Inserts:
--    • 1 admin user  (email: admin@govinfo.in / password: Admin@123)
--    • 18 realistic Indian government notifications across 6 departments
-- ============================================================

SET NAMES utf8mb4;

-- ── Admin User ────────────────────────────────────────────────
-- Password: Admin@123
-- Hash generated with: bcrypt.hashSync('Admin@123', 10)
-- If this hash doesn't work after re-seeding, run:
--   node backend/scripts/fix-admin-password.js
INSERT INTO User (name, email, password_hash, role) VALUES
(
  'GovInfo Admin',
  'admin@govinfo.in',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'admin'
);

-- ── Notifications ─────────────────────────────────────────────
-- Departments represented:
--   CBSE, NTA, Ministry of Education, PM Kisan / Ministry of Agriculture,
--   Ministry of Finance, UPSC, Ministry of Health, UGC

INSERT INTO Notification
  (title, description, department, source_url, published_date)
VALUES

-- 1. CBSE
(
  'CBSE Class 10 Board Examination Results 2024 Declared',
  'The Central Board of Secondary Education (CBSE) has officially declared the Class 10 board examination results for the academic year 2023-24. Students can check their results on the official CBSE website cbseresults.nic.in by entering their roll number and date of birth. The overall pass percentage stands at 93.60%, with girls outperforming boys for the sixteenth consecutive year. Students who wish to apply for re-evaluation or verification of marks can submit their application within 21 days of result declaration. Compartment examination dates will be notified separately.',
  'CBSE',
  'https://cbseresults.nic.in',
  '2024-05-13'
),

-- 2. CBSE
(
  'CBSE Class 12 Board Examination Results 2024 Announced',
  'CBSE has announced the Class 12 board examination results for 2023-24. The overall pass percentage is 87.98%. Science, Commerce, and Humanities streams are included. Students can access their digital mark sheets via DigiLocker. The merit list will not be released as per the Board''s policy. Students who have not passed in one or two subjects may appear in the compartment examination. Re-checking and re-evaluation applications can be submitted online through the CBSE official portal.',
  'CBSE',
  'https://cbse.gov.in/cbsenew/cbse.html',
  '2024-05-24'
),

-- 3. NTA
(
  'JEE Main 2024 Session 2 Result Published — NTA Score Card Available',
  'The National Testing Agency (NTA) has published the JEE Main 2024 Session 2 results on the official website jeemain.nta.nic.in. Candidates can download their NTA Score Card by logging in with their application number and date of birth. The final merit list and JEE Advanced 2024 eligibility list will be prepared based on the best of two sessions. Candidates are advised to keep their score card safely for future reference. Any discrepancy in result should be reported to NTA within 10 days.',
  'NTA',
  'https://jeemain.nta.nic.in',
  '2024-04-25'
),

-- 4. NTA
(
  'NEET UG 2024 Admit Card Released by NTA — Download Now',
  'National Testing Agency has released the NEET UG 2024 admit card on the official portal neet.nta.nic.in. Candidates who have successfully registered for the National Eligibility cum Entrance Test (Undergraduate) can download their hall ticket by entering their application number and password. The examination is scheduled to be held on 5th May 2024 across 4,750 examination centres in 571 cities. Candidates must carry the admit card along with a valid photo ID proof to the examination hall. No admit card will be issued at the centre.',
  'NTA',
  'https://neet.nta.nic.in',
  '2024-04-17'
),

-- 5. NTA
(
  'UGC NET December 2024 Examination Schedule Released',
  'NTA has released the examination schedule for UGC NET December 2024. The examination will be conducted in Computer Based Test (CBT) mode across 93 subjects. Registrations are open from 15th September to 15th October 2024. The examination is tentatively scheduled for November–December 2024. Candidates are advised to visit the official website ugcnet.nta.nic.in for detailed information on eligibility criteria, exam pattern, syllabus, and city intimation slip download dates.',
  'NTA',
  'https://ugcnet.nta.nic.in',
  '2024-09-01'
),

-- 6. Ministry of Education
(
  'National Scholarship Portal 2024-25 — Pre-Matric and Post-Matric Applications Open',
  'The Ministry of Education has opened applications for Pre-Matric and Post-Matric Scholarships for the academic year 2024-25 on the National Scholarship Portal (NSP). Students from SC, ST, OBC, EBC, and minority communities are eligible to apply. The last date to submit fresh applications is 31st October 2024 and for renewal applications is 15th October 2024. Students must submit their applications through their respective institution logins. The scholarship amount will be directly credited to the beneficiary''s Aadhaar-linked bank account.',
  'Ministry of Education',
  'https://scholarships.gov.in',
  '2024-08-01'
),

-- 7. Ministry of Education
(
  'PM YASASVI Scholarship Scheme 2024 — Notification for OBC and EBC Students',
  'The Prime Minister Young Achievers Scholarship Award Scheme for Vibrant India (PM YASASVI) is now open for 2024. Administered by the Ministry of Social Justice and Empowerment, this scheme provides scholarships to OBC, EBC, and DNT students studying in Class 9 and Class 11. The scholarship amount is Rs. 75,000 per annum for Class 9 students and Rs. 1,25,000 per annum for Class 11 students. Candidates must appear in the YASASVI Entrance Test conducted by NTA. Applications can be submitted at yet.nta.ac.in.',
  'Ministry of Education',
  'https://yet.nta.ac.in',
  '2024-07-15'
),

-- 8. Ministry of Agriculture / PM Kisan
(
  'PM-KISAN 17th Installment Released — Rs. 2000 Transferred to Farmers',
  'Prime Minister Narendra Modi has released the 17th installment of PM-KISAN (Pradhan Mantri Kisan Samman Nidhi) scheme. An amount of Rs. 2,000 has been directly transferred to the bank accounts of over 9.26 crore eligible farmer families across the country. Farmers can check their payment status on the official portal pmkisan.gov.in by entering their Aadhaar number or mobile number or bank account number. Farmers who have not yet registered can visit their nearest Common Service Centre (CSC) for enrollment.',
  'Ministry of Agriculture',
  'https://pmkisan.gov.in',
  '2024-06-18'
),

-- 9. Ministry of Agriculture
(
  'Pradhan Mantri Fasal Bima Yojana — Kharif 2024 Enrollment Deadline Extended',
  'The Ministry of Agriculture and Farmers'' Welfare has extended the enrollment deadline for Pradhan Mantri Fasal Bima Yojana (PMFBY) for Kharif 2024 season. Farmers can now enroll up to 31st July 2024. The scheme provides comprehensive crop insurance coverage against natural calamities, pests, and diseases. Non-loanee farmers can apply through the official PMFBY portal, Common Service Centres, or through their nearest bank. The premium rate is 2% for Kharif crops, 1.5% for Rabi crops, and 5% for annual commercial and horticultural crops.',
  'Ministry of Agriculture',
  'https://pmfby.gov.in',
  '2024-07-10'
),

-- 10. Ministry of Finance
(
  'Union Budget 2024-25 Key Highlights — Tax Slabs, Exemptions, and New Schemes',
  'The Finance Minister presented the Union Budget 2024-25 in Parliament. Key highlights include: revised income tax slabs under the new tax regime offering relief to salaried taxpayers, increased standard deduction from Rs. 50,000 to Rs. 75,000, long-term capital gains tax revised to 12.5% without indexation benefit, enhanced allocation for infrastructure under PM Gati Shakti, and launch of new schemes for employment-linked incentives. The fiscal deficit target is set at 4.9% of GDP. Full budget documents are available on the Union Budget portal.',
  'Ministry of Finance',
  'https://indiabudget.gov.in',
  '2024-07-23'
),

-- 11. Ministry of Finance
(
  'Income Tax Return Filing Deadline Extended to 31st August 2024',
  'The Central Board of Direct Taxes (CBDT) has extended the due date for filing Income Tax Returns (ITR) for Assessment Year 2024-25 for non-audit taxpayers from 31st July 2024 to 31st August 2024. Taxpayers are advised to file their returns well before the deadline to avoid late fee under Section 234F. The e-filing portal incometax.gov.in has been upgraded with pre-filled data from Form 16, Form 26AS, and AIS to simplify the filing process. Taxpayers facing technical issues can contact the helpdesk at 1800-103-0025.',
  'Ministry of Finance',
  'https://incometax.gov.in',
  '2024-07-26'
),

-- 12. UPSC
(
  'UPSC Civil Services Preliminary Examination 2024 — Admit Card Released',
  'The Union Public Service Commission (UPSC) has released the admit card for Civil Services Preliminary Examination 2024. Candidates can download their e-Admit card from the UPSC official website upsc.gov.in using their registration ID and date of birth. The examination is scheduled for 16th June 2024 across various centres throughout India. Candidates are required to bring a printed copy of the e-Admit card along with an original and self-attested photocopy of any one of the prescribed photo ID proofs. Reporting time is 30 minutes before the commencement of the examination.',
  'UPSC',
  'https://upsc.gov.in',
  '2024-05-27'
),

-- 13. UPSC
(
  'UPSC Combined Defence Services Examination (II) 2024 Notification',
  'Union Public Service Commission has released the notification for Combined Defence Services (CDS) Examination (II) 2024. The examination will be conducted on 1st September 2024. Applications are invited from unmarried male and unmarried female candidates for admission to Indian Military Academy, Indian Naval Academy, Air Force Academy, and Officers'' Training Academy. The last date to apply is 16th July 2024. Eligibility: age between 19-25 years (varies by academy), educational qualification of graduation for IMA/INA/AFA and graduation for OTA. Apply online at upsconline.nic.in.',
  'UPSC',
  'https://upsc.gov.in',
  '2024-06-05'
),

-- 14. Ministry of Health
(
  'Ayushman Bharat PM-JAY — Expansion to All Citizens Above 70 Years Announced',
  'The Government of India has announced the expansion of Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (PM-JAY) to cover all senior citizens aged 70 years and above, irrespective of their income level. Eligible seniors will receive health coverage of up to Rs. 5 lakh per year per family for secondary and tertiary care hospitalization. Beneficiaries can avail cashless treatment at any of the 29,000+ empanelled hospitals across India. Enrollment can be done through the Ayushman Bharat portal, CSCs, or by showing the Aadhaar card at empanelled hospitals. This scheme is expected to benefit over 6 crore senior citizens.',
  'Ministry of Health',
  'https://pmjay.gov.in',
  '2024-09-29'
),

-- 15. Ministry of Health
(
  'National Health Mission — New Guidelines for Janani Suraksha Yojana Beneficiaries',
  'The Ministry of Health and Family Welfare has issued revised guidelines for the Janani Suraksha Yojana (JSY) under the National Health Mission (NHM). The cash incentive for institutional delivery has been revised upwards for BPL pregnant women in low-performing states and high-performing states. ASHA workers'' performance-linked incentives have also been revised. Accredited Social Health Activists (ASHAs) are instructed to accompany pregnant women to health facilities for delivery. State governments are directed to update beneficiary lists and disburse payments through DBT within 15 days of delivery.',
  'Ministry of Health',
  'https://nhm.gov.in',
  '2024-04-05'
),

-- 16. UGC
(
  'UGC Guidelines for Online and Distance Learning Programs 2024 — Updated Norms',
  'The University Grants Commission (UGC) has released updated guidelines for Online and Distance Learning (ODL) programs for the academic year 2024-25. Universities offering ODL programs must comply with the revised eligibility norms, quality benchmarks, and student support services. The maximum permissible intake in online programs has been revised. All universities must register their ODL programs on the UGC portal. Students enrolling in ODL programs must verify that the program is listed on the UGC-approved list before applying. Unrecognized ODL programs will not be considered valid for government employment.',
  'UGC',
  'https://ugc.ac.in',
  '2024-03-15'
),

-- 17. Ministry of Education
(
  'Kendriya Vidyalaya Sangathan Class 1 Admission 2024-25 — Registration Open',
  'Kendriya Vidyalaya Sangathan (KVS) has opened online registrations for Class 1 admissions for the academic year 2024-25. Parents/guardians can apply online at kvsonlineadmission.kvs.gov.in. The registration window is open from 1st April to 15th April 2024. Priority categories include children of central government employees, children of employees of autonomous bodies, and children from the general public. Age criteria: child must be between 6 and 8 years as on 31st March 2024. Documents required include birth certificate, service certificate (for applicable categories), and residence proof.',
  'Ministry of Education',
  'https://kvsonlineadmission.kvs.gov.in',
  '2024-04-01'
),

-- 18. NTA
(
  'CUET UG 2024 Result Declared — University Admissions to Begin',
  'The National Testing Agency has declared the CUET UG 2024 results on cuetug.nta.nic.in. Students who appeared in the Common University Entrance Test (Undergraduate) can download their scorecards by logging in with their application number and date of birth. Over 13.48 lakh candidates appeared in the examination conducted across 379 cities. Participating universities will now begin their individual admission processes based on CUET UG scores. Students are advised to regularly check the websites of their preferred universities for admission schedules, cut-off lists, and counselling dates.',
  'NTA',
  'https://cuetug.nta.nic.in',
  '2024-07-01'
);
