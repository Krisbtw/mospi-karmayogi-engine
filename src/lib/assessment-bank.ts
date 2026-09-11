import type { Difficulty } from './types';

export interface BankQ { q: string; o: [string, string, string, string]; c: number; e: string; d: Difficulty; b: string; }

export const BANK: Record<string, BankQ[]> = {
  'C-SAMP': [
    { q: 'Dividing a population into homogeneous groups before sample selection is called:', o: ['Cluster sampling', 'Stratification', 'Quota selection', 'Snowball sampling'], c: 1, e: 'Stratification divides the population into internally homogeneous strata, improving precision within each group.', d: 'Easy', b: 'Remember' },
    { q: 'Probability proportional to size (PPS) sampling is used mainly to:', o: ['Reduce non-response', 'Give larger units a higher selection chance', 'Eliminate the sampling frame', 'Fix the response rate'], c: 1, e: 'PPS assigns higher selection probabilities to larger units so estimates reflect their contribution.', d: 'Medium', b: 'Understand' },
    { q: 'The design effect compares the efficiency of a complex sample against:', o: ['A census', 'Simple random sampling', 'Systematic listing', 'Purposive selection'], c: 1, e: 'The design effect measures variance inflation relative to a simple random sample of the same size.', d: 'Medium', b: 'Analyze' },
  ],
  'C-SMET': [
    { q: 'A pilot test of a questionnaire is primarily used to:', o: ['Estimate the budget', 'Detect ambiguous wording before the main round', 'Select respondents', 'Publish results early'], c: 1, e: 'Pilot testing surfaces ambiguous or faulty question wording before the main survey round.', d: 'Easy', b: 'Understand' },
    { q: 'A fixed reference period such as a 30-day recall window is used to:', o: ['Reduce recall errors', 'Increase the sample size', 'Shorten training', 'Avoid weighting'], c: 0, e: 'Fixed, short recall windows reduce respondent recall error in household surveys.', d: 'Medium', b: 'Understand' },
    { q: 'Which of the following is a source of non-sampling error?', o: ['Random sampling fluctuation', 'Coverage mistakes in the frame', 'Stratified selection', 'Probability proportional selection'], c: 1, e: 'Non-sampling errors arise from coverage mistakes, respondent errors and processing mistakes.', d: 'Medium', b: 'Understand' },
  ],
  'C-DVAL': [
    { q: 'A range check confirms that:', o: ['The file transferred fully', 'Numeric values fall between plausible limits', 'Two datasets agree', 'The sample is random'], c: 1, e: 'Range checks confirm numeric values fall between plausible minimum and maximum limits.', d: 'Easy', b: 'Remember' },
    { q: 'A consistency check compares:', o: ['Two ministries', 'Related fields such as age and date of birth', 'Yesterday and today', 'Raw and published reports'], c: 1, e: 'Consistency checks compare related fields, such as age against date of birth.', d: 'Medium', b: 'Apply' },
    { q: 'Skip logic validation ensures that:', o: ['All questions are answered', 'Unanswered questions follow the correct filter pattern', 'Data is encrypted', 'Respondents are unique'], c: 1, e: 'Skip logic validation ensures unanswered questions follow the correct questionnaire filter pattern.', d: 'Medium', b: 'Apply' },
  ],
  'C-STAT': [
    { q: 'The standard error measures:', o: ['Bias', 'The variability of an estimate across repeated samples', 'The mean value', 'The population size'], c: 1, e: 'The standard error measures how much an estimate would vary across repeated samples.', d: 'Easy', b: 'Understand' },
    { q: 'A 95% confidence interval means that:', o: ['95% of the data lie inside the interval', 'The procedure captures the true value in 95% of repeated samples', 'The estimate is 95% correct', 'The sample is 95% random'], c: 1, e: 'A confidence interval refers to the long-run coverage of the estimation procedure, not the data.', d: 'Medium', b: 'Understand' },
    { q: 'Weighting adjustments primarily correct for:', o: ['Unknown variance', 'Unequal selection probabilities and non-response', 'Rounding errors', 'Outliers'], c: 1, e: 'Weights correct for unequal selection probabilities and compensate for non-response.', d: 'Hard', b: 'Analyze' },
  ],
  'C-VIZ': [
    { q: 'Which chart best shows the change of an indicator over time?', o: ['Line chart', 'Pie chart', 'Scatter plot', 'Data table'], c: 0, e: 'Line charts are the standard choice for trends over time.', d: 'Easy', b: 'Remember' },
    { q: 'A histogram is used to display:', o: ['Shares of a total', 'The distribution of a numeric variable', 'Trends over years', 'Geographic patterns'], c: 1, e: 'Histograms show the empirical distribution of a numeric variable.', d: 'Medium', b: 'Understand' },
    { q: 'Data storytelling in government reports mainly aims to:', o: ['Decorate pages', 'Make findings understandable to non-technical readers', 'Hide uncertainty', 'Replace statistics'], c: 1, e: 'Data storytelling makes analytical findings accessible to non-technical decision makers.', d: 'Medium', b: 'Understand' },
  ],
  'C-PROG': [
    { q: 'In R or Python, a data frame is:', o: ['A statistical test', 'A table of rows and columns', 'A plot', 'A database server'], c: 1, e: 'A data frame is a rectangular table of rows (observations) and columns (variables).', d: 'Easy', b: 'Remember' },
    { q: 'Which task is best handled by a scripting language such as R?', o: ['Designing questionnaires', 'Reproducible data cleaning and analysis', 'Printing forms', 'Field travel plans'], c: 1, e: 'Scripts make cleaning and analysis reproducible end-to-end from raw data.', d: 'Medium', b: 'Apply' },
    { q: 'A reproducible analysis pipeline mainly requires:', o: ['Manual edits in spreadsheets', 'Scripts that run end-to-end from raw data', 'Printed output', 'Verbal handover'], c: 1, e: 'Reproducibility requires scripted, end-to-end processing from raw data to results.', d: 'Medium', b: 'Understand' },
  ],
  'C-DQUL': [
    { q: 'Timeliness, completeness and accuracy are dimensions of:', o: ['Sample size', 'Data quality', 'Budget', 'Staffing'], c: 1, e: 'These are core dimensions tracked on a data quality framework.', d: 'Easy', b: 'Remember' },
    { q: 'Root cause analysis of validation failures traces errors back to:', o: ['The press', 'The source process', 'Random chance', 'The server room'], c: 1, e: 'Root cause analysis traces recurring failures back to the process that produced them.', d: 'Medium', b: 'Analyze' },
    { q: 'A correction log preserves:', o: ['Only final values', 'The original value alongside every modified entry', 'Deleted files', 'Passwords'], c: 1, e: 'Correction logs preserve original values alongside every modified entry for auditability.', d: 'Medium', b: 'Remember' },
  ],
  'C-PROJ': [
    { q: 'The critical path of a survey project is the sequence of tasks that:', o: ['Costs the most', 'Determines the minimum project duration', 'Requires the fewest staff', 'Has no deadlines'], c: 1, e: 'The critical path determines the minimum possible project duration.', d: 'Medium', b: 'Understand' },
    { q: 'Supervisor spot checks on a sample of completed schedules are a form of:', o: ['Sampling frame design', 'Quality control', 'Data entry', 'Publication'], c: 1, e: 'Spot checks are an in-field quality control mechanism.', d: 'Easy', b: 'Remember' },
    { q: 'A milestone is best described as:', o: ['A budget line', 'A dated, verifiable deliverable', 'A staff posting', 'A dataset'], c: 1, e: 'Milestones are dated, verifiable deliverables used to track progress.', d: 'Medium', b: 'Understand' },
  ],
  'C-GIS': [
    { q: 'An enumeration area boundary is used to:', o: ['Price land', 'Define the geographic scope of field listing', 'Store responses', 'Train staff'], c: 1, e: 'Enumeration area boundaries define the geographic scope for listing and fieldwork.', d: 'Easy', b: 'Remember' },
    { q: 'Digitally mapping survey clusters requires:', o: ['A sampling frame only', 'Geo-coordinates linked to area boundaries', 'A budget sheet', 'Questionnaires only'], c: 1, e: 'Cluster mapping needs geo-coordinates linked to the area boundaries used in selection.', d: 'Medium', b: 'Apply' },
    { q: 'Spatial analysis of survey data can reveal:', o: ['Keyboard errors', 'Geographic patterns and regional differences', 'File sizes', 'Response rates only'], c: 1, e: 'Spatial analysis surfaces geographic patterns and regional differences.', d: 'Medium', b: 'Analyze' },
  ],
  'C-ML': [
    { q: 'Supervised learning requires:', o: ['Unlabeled data', 'Examples with known outcomes', 'Only text', 'A map'], c: 1, e: 'Supervised learning trains on examples whose outcomes are already known.', d: 'Easy', b: 'Remember' },
    { q: 'Overfitting means a model:', o: ['Fits training data too closely and generalizes poorly', 'Runs too slowly', 'Uses too few features', 'Is untrained'], c: 0, e: 'Overfitting is memorising training data at the cost of generalisation.', d: 'Medium', b: 'Understand' },
    { q: 'In official statistics, machine learning is most often used for:', o: ['Replacing the census', 'Classification and imputation support tasks', 'Field travel', 'Legal drafting'], c: 1, e: 'ML supports classification and imputation tasks in statistical production.', d: 'Medium', b: 'Understand' },
  ],
  'C-COMM': [
    { q: 'An executive summary should:', o: ['Include all raw tables', 'State key findings and recommendations concisely', 'Hide limitations', 'Replace the report'], c: 1, e: 'Executive summaries state key findings and recommendations concisely.', d: 'Easy', b: 'Understand' },
    { q: 'Reporting uncertainty in official publications:', o: ['Is optional decoration', 'Builds trust by showing confidence limits', 'Confuses readers', 'Reduces accuracy'], c: 1, e: 'Showing confidence limits builds trust in official figures.', d: 'Medium', b: 'Understand' },
    { q: 'The best way to present a regional comparison to officers is:', o: ['A 100-row table', 'A ranked chart with a short caption', 'A raw CSV file', 'Footnotes only'], c: 1, e: 'Ranked charts with captions communicate regional comparisons effectively.', d: 'Medium', b: 'Apply' },
  ],
  'C-OSTA': [
    { q: 'The National Statistical Office operates under:', o: ['NITI Aayog', 'The Ministry of Statistics & Programme Implementation', 'The Ministry of Finance', 'The RBI'], c: 1, e: 'The NSO functions under MoSPI.', d: 'Easy', b: 'Remember' },
    { q: 'Official statistics must follow the principle of:', o: ['Secrecy', 'Impartiality and methodological transparency', 'Speed over accuracy', 'Profit'], c: 1, e: 'Impartiality and transparent methodology are core principles of official statistics.', d: 'Medium', b: 'Understand' },
    { q: 'De-identified unit-level data is released to:', o: ['Protect respondent confidentiality while enabling analysis', 'Increase file sizes', 'Slow down research', 'Avoid peer review'], c: 0, e: 'De-identification protects confidentiality while enabling secondary analysis.', d: 'Medium', b: 'Understand' },
  ],
};
