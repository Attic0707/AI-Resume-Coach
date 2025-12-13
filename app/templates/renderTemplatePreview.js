// app/templates/renderTemplatePreview.js
import React from "react";
import { View, Text, Image } from "react-native";
import { previewBaseStyles, minimalWhiteStyles, stanfordChronologicalStyles, stanfordTechnicalStyles } from "./templateStyles";

// Merge all style groups into a single object
const styles = {
  ...previewBaseStyles,
  ...minimalWhiteStyles,
  ...stanfordChronologicalStyles,
  ...stanfordTechnicalStyles,
};

/**
 * Single source of truth for how each template is visually rendered.
 *
 * @param {object} params
 * @param {string} params.templateId
 * @param {object} params.data - normalized preview data
 * @param {string|null} params.photoUri - optional photo uri
 */
export function renderTemplatePreview({ templateId, data, photoUri }) {
  const {
    name,
    headline,
    summary,
    contact,
    experience,
    education,
    skills,
    projects,
    languages,
    expertise,
    certificates,
    publishes,
    referrals,
  } = data;

  const mainName = name || "Your Name";
  const mainHeadline = headline || "Target Role / Headline";

  const Section = ({ title, text, sectionStyle, titleStyle, bodyStyle }) => {
    if (!text?.trim()) return null;
    return (
      <View style={sectionStyle || styles.pvSection}>
        <Text style={titleStyle || styles.pvSectionTitle}>{title}</Text>
        <Text style={bodyStyle || styles.pvSectionBody}>{text.trim()}</Text>
      </View>
    );
  };

  const contactLines = contact
    ? contact
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
    : [];

  const toChips = (text = "") =>
    text
      .split(/[,;•\n]+/g)
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 20);

  const renderSkillChips = (text, chipWrapStyle, chipStyle, chipTextStyle) => {
    const chips = toChips(text);
    if (!chips.length) return null;
    return (
      <View style={chipWrapStyle || styles.pvChipWrap}>
        {chips.map((c, idx) => (
          <View key={idx} style={chipStyle || styles.pvChip}>
            <Text style={chipTextStyle || styles.pvChipText}>{c}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderContact = (text, lineStyle) => {
    if (!text?.trim()) return null;
    return (
      <View style={styles.pvContactBlock}>
        {text
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line, idx) => (
            <Text key={idx} style={lineStyle || styles.pvContactText}>
              {line}
            </Text>
          ))}
      </View>
    );
  };

  switch (templateId) {
    /**
     * 0) MINIMAL WHITE
     */
    case "minimalWhite": {
      const contactLines = contact
        ? contact
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean)
        : [];

      const hasSkills = !!skills?.trim();

      return (
        <View style={styles.mwPageOuter}>
          <View style={styles.mwPageInner}>
            {/* Header */}
            <View style={styles.mwHeader}>
              {/* PHOTO LEFT */}
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.mwPhoto} />
              ) : (
                <View style={styles.mwPhotoPreviewPlaceholder}>
                  <Text style={styles.mwPhotoInitials}>
                    {mainName
                      ? mainName
                          .split(" ")
                          .map((p) => p[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()
                      : "PH"}
                  </Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.mwName}>
                  {mainName || "YOUR NAME"}
                </Text>
                <Text style={styles.mwRole}>
                  {mainHeadline || "Target Role / Headline"}
                </Text>
              </View>
            </View>

            <View style={styles.mwDivider} />

            {/* Body: two columns */}
            <View style={styles.mwBodyRow}>
              {/* LEFT COLUMN */}
              <View style={styles.mwLeftCol}>
                {/* Contact */}
                {contactLines.length > 0 && (
                  <View style={styles.mwSectionBlock}>
                    <Text style={styles.mwSectionTitle}>CONTACT</Text>
                    {contactLines.map((line, idx) => (
                      <Text key={idx} style={styles.mwSmallText}>
                        {line}
                      </Text>
                    ))}
                  </View>
                )}

                {/* Profile / Summary */}
                {summary?.trim() ? (
                  <View style={styles.mwSectionBlock}>
                    <Text style={styles.mwSectionTitle}>PROFILE</Text>
                    <Text style={styles.mwBodyText}>{summary.trim()}</Text>
                  </View>
                ) : null}

                {/* Skills */}
                {hasSkills && (
                  <View style={styles.mwSectionBlock}>
                    <Text style={styles.mwSectionTitle}>SKILLS</Text>
                    <View style={styles.mwBulletGroup}>
                      {skills
                        .split(/[,;•\n]+/g)
                        .map((t) => t.trim())
                        .filter(Boolean)
                        .slice(0, 12)
                        .map((skill, idx) => (
                          <Text key={idx} style={styles.mwSmallText}>
                            • {skill}
                          </Text>
                        ))}
                    </View>
                  </View>
                )}

                {/* Languages (optional) */}
                {languages?.trim() ? (
                  <View style={styles.mwSectionBlock}>
                    <Text style={styles.mwSectionTitle}>LANGUAGES</Text>
                    <Text style={styles.mwBodyText}>
                      {languages.trim()}
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* RIGHT COLUMN */}
              <View style={styles.mwRightCol}>
                {/* Experience */}
                {experience?.trim() ? (
                  <View style={styles.mwSectionBlock}>
                    <Text style={styles.mwSectionTitle}>EXPERIENCE</Text>
                    <Text style={styles.mwBodyText}>
                      {experience.trim()}
                    </Text>
                  </View>
                ) : null}

                {/* Projects */}
                {projects?.trim() ? (
                  <View style={styles.mwSectionBlock}>
                    <Text style={styles.mwSectionTitle}>PROJECTS</Text>
                    <Text style={styles.mwBodyText}>
                      {projects.trim()}
                    </Text>
                  </View>
                ) : null}

                {/* Education */}
                {education?.trim() ? (
                  <View style={styles.mwSectionBlock}>
                    <Text style={styles.mwSectionTitle}>EDUCATION</Text>
                    <Text style={styles.mwBodyText}>
                      {education.trim()}
                    </Text>
                  </View>
                ) : null}

                {/* Extras – expertise / certificates / publishes */}
                {expertise?.trim() ? (
                  <View style={styles.mwSectionBlock}>
                    <Text style={styles.mwSectionTitle}>EXPERTISE</Text>
                    <Text style={styles.mwBodyText}>
                      {expertise.trim()}
                    </Text>
                  </View>
                ) : null}

                {certificates?.trim() ? (
                  <View style={styles.mwSectionBlock}>
                    <Text style={styles.mwSectionTitle}>CERTIFICATES</Text>
                    <Text style={styles.mwBodyText}>
                      {certificates.trim()}
                    </Text>
                  </View>
                ) : null}

                {publishes?.trim() ? (
                  <View style={styles.mwSectionBlock}>
                    <Text style={styles.mwSectionTitle}>
                      PUBLICATIONS & AWARDS
                    </Text>
                    <Text style={styles.mwBodyText}>
                      {publishes.trim()}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        </View>
      );
    }

    /**
     * 1) CHRONOLOGICAL
     */
    case "stanfordChronological": {
        const formatBullets = (text = "") =>
            text
            .split(/\n+/g)
            .map((l) => l.trim())
            .filter(Boolean)
            .map((line, idx) => (
                <View key={idx} style={styles.scBulletRow}>
                <Text style={styles.scBullet}>•</Text>
                <Text style={styles.scBulletText}>{line}</Text>
                </View>
            ));

        return (
            <View style={styles.scPageOuter}>
            <View style={styles.scPageInner}>

                {/* HEADER */}
                <View style={styles.scHeader}>
                <Text style={styles.scName}>{mainName || "YOUR NAME"}</Text>

                {contact?.trim() ? (
                    <Text style={styles.scContactLine}>
                    {contact
                        .split("\n")
                        .map((l) => l.trim())
                        .filter(Boolean)
                        .join("  •  ")}
                    </Text>
                ) : (
                    <Text style={styles.scContactLine}>
                    email@example.com  •  (555) 555-5555  •  linkedin.com/in/you
                    </Text>
                )}
                </View>

                {/* Divider */}
                <View style={styles.scDivider} />

                {/* EDUCATION */}
                {education?.trim() ? (
                <View style={styles.scSectionBlock}>
                    <Text style={styles.scSectionTitle}>EDUCATION</Text>

                    <View style={styles.scSubHeaderRow}>
                    <Text style={styles.scSubHeaderMain}>
                        University / School Name — Degree
                    </Text>
                    <Text style={styles.scDateText}>2020 – 2024</Text>
                    </View>

                    {formatBullets(education)}
                </View>
                ) : null}

                {/* EXPERIENCE */}
                {experience?.trim() ? (
                <View style={styles.scSectionBlock}>
                    <Text style={styles.scSectionTitle}>EXPERIENCE</Text>

                    <View style={styles.scSubHeaderRow}>
                    <Text style={styles.scSubHeaderMain}>
                        Company Name — Job Title
                    </Text>
                    <Text style={styles.scDateText}>2018 – 2020</Text>
                    </View>

                    {formatBullets(experience)}
                </View>
                ) : null}

                {/* PROJECTS (optional) */}
                {projects?.trim() ? (
                <View style={styles.scSectionBlock}>
                    <Text style={styles.scSectionTitle}>PROJECTS</Text>
                    {formatBullets(projects)}
                </View>
                ) : null}

                {/* SKILLS */}
                {skills?.trim() ? (
                <View style={styles.scSectionBlock}>
                    <Text style={styles.scSectionTitle}>SKILLS</Text>
                    <Text style={styles.scBodyText}>{skills.trim()}</Text>
                </View>
                ) : null}
            </View>
            </View>
        );
    }

    /**
     * 2) STANFORD TECHNICAL RESUME
     * - Education first
     * - Strong TECHNICAL SKILLS block
     * - Projects + Experience
     * - Activities / Awards last
     */
    case "stanfordTechnical": {
      // Prefer "expertise" for TECHNICAL SKILLS. Fallback to skills.
      const technicalBlock = (expertise && expertise.trim()) || skills || "";
      const hasTechnicalBlock = !!technicalBlock.trim();
      const hasProjects = !!projects?.trim();
      const hasExperience = !!experience?.trim();
      const hasEducation = !!education?.trim();
      const hasActivities =
        !!publishes?.trim() || !!certificates?.trim() || !!referrals?.trim();

      // Turn technical text into bullet-style lines
      const renderTechnicalLines = () => {
        if (!hasTechnicalBlock) return null;

        const lines = technicalBlock
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);

        // If the user used colon-separated categories, keep them as title + line.
        // e.g. "Languages: Java, Python, C++"
        return (
          <View style={styles.stIndentedBlock}>
            {lines.map((line, idx) => {
              if (line.includes(":")) {
                const [labelPart, rest] = line.split(":");
                return (
                  <Text key={idx} style={styles.stBodyText}>
                    <Text style={styles.stBodyBold}>
                      {labelPart.trim()}
                      {": "}
                    </Text>
                    {rest ? rest.trim() : ""}
                  </Text>
                );
              }
              return (
                <Text key={idx} style={styles.stBodyText}>
                  • {line}
                </Text>
              );
            })}
          </View>
        );
      };

      // Simple helper to render blocks of text (experience, projects, etc.)
      const renderMultilineBlock = (text) => {
        if (!text?.trim()) return null;
        return (
          <View style={styles.stIndentedBlock}>
            {text
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean)
              .map((line, idx) => (
                <Text key={idx} style={styles.stBodyText}>
                  {line}
                </Text>
              ))}
          </View>
        );
      };

      // Activities / Awards at the bottom
      const renderActivitiesBlock = () => {
        if (!hasActivities) return null;

        return (
          <View style={styles.stIndentedBlock}>
            {publishes?.trim() && (
              <Text style={styles.stBodyText}>{publishes.trim()}</Text>
            )}
            {certificates?.trim() && (
              <Text style={styles.stBodyText}>{certificates.trim()}</Text>
            )}
            {referrals?.trim() && (
              <Text style={styles.stBodyText}>{referrals.trim()}</Text>
            )}
          </View>
        );
      };

      return (
        <View style={styles.stPageOuter}>
          <View style={styles.stPageInner}>
            {/* HEADER */}
            <View style={styles.stHeaderRow}>
              <View style={styles.stHeaderLeft}>
                <Text style={styles.stName}>{mainName}</Text>
                <Text style={styles.stHeadline}>
                  {mainHeadline || "Technical Resume"}
                </Text>
              </View>

              <View style={styles.stHeaderRight}>
                {contactLines.map((line, idx) => (
                  <Text key={idx} style={styles.stContactText}>
                    {line}
                  </Text>
                ))}
              </View>
            </View>

            {/* Optional one-line summary just under header */}
            {summary?.trim() ? (
              <View style={styles.stSummaryRow}>
                <Text style={styles.stSummaryText}>{summary.trim()}</Text>
              </View>
            ) : null}

            <View style={styles.stDivider} />

            {/* EDUCATION FIRST */}
            {hasEducation && (
              <Section title="EDUCATION">
                {renderMultilineBlock(education)}
              </Section>
            )}

            {/* TECHNICAL SKILLS */}
            {hasTechnicalBlock && (
              <Section title="TECHNICAL SKILLS">
                {renderTechnicalLines()}
              </Section>
            )}

            {/* PROJECTS (often very important for tech) */}
            {hasProjects && (
              <Section title="PROJECTS">
                {renderMultilineBlock(projects)}
              </Section>
            )}

            {/* RELEVANT EXPERIENCE */}
            {hasExperience && (
              <Section title="EXPERIENCE">
                {renderMultilineBlock(experience)}
              </Section>
            )}

            {/* ACTIVITIES / AWARDS / EXTRAS */}
            {hasActivities && (
              <Section title="ACTIVITIES & AWARDS">
                {renderActivitiesBlock()}
              </Section>
            )}

            {/* Optional Languages at bottom */}
            {languages?.trim() && (
              <Section title="LANGUAGES">
                <View style={styles.stIndentedBlock}>
                  <Text style={styles.stBodyText}>{languages.trim()}</Text>
                </View>
              </Section>
            )}
          </View>
        </View>
      );
    }

    /**
     * 3) STANFORD BUSINESS RESUME
     * - Education first
     * - Strong BUSINESS SKILLS block
     * - Projects + Experience
     * - Activities / Awards last
     */
    case "stanfordBusiness": {
        const mainName = name || "YOUR NAME";
        const mainHeadline =
            headline || "Business / Management / Consulting Candidate";

        const contactLines = contact
            ? contact
                .split("\n")
                .map((l) => l.trim())
                .filter(Boolean)
            : [];

        const hasEducation = !!education?.trim();
        const hasExperience = !!experience?.trim();
        const hasLeadership =
            !!projects?.trim() || !!publishes?.trim() || !!referrals?.trim();
        const hasSkillsInterests =
            !!skills?.trim() || !!languages?.trim() || !!expertise?.trim();

        // Small Section helper (if you don't already have it above the switch)
        const Section = ({ title, children }) => {
            if (!children) return null;
            return (
            <View style={styles.stSection}>
                <Text style={styles.stSectionTitle}>{title}</Text>
                {children}
            </View>
            );
        };

        // Render multi-line text blocks like Education / Experience
        const renderMultilineBlock = (text) => {
            if (!text?.trim()) return null;
            const lines = text
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean);

            return (
            <View style={styles.stIndentedBlock}>
                {lines.map((line, idx) => (
                <Text key={idx} style={styles.stBodyText}>
                    {line}
                </Text>
                ))}
            </View>
            );
        };

        // Leadership & Activities – mix projects + publishes + referrals
        const renderLeadershipBlock = () => {
            if (!hasLeadership) return null;

            const blocks = [];

            if (projects?.trim()) {
            blocks.push(projects.trim());
            }
            if (publishes?.trim()) {
            blocks.push(publishes.trim());
            }
            if (referrals?.trim()) {
            blocks.push(referrals.trim());
            }

            return (
            <View style={styles.stIndentedBlock}>
                {blocks.map((block, idx) => (
                <Text key={idx} style={styles.stBodyText}>
                    {block}
                </Text>
                ))}
            </View>
            );
        };

        // Skills & Interests – compress skills + languages + expertise
        const renderSkillsInterestsBlock = () => {
            if (!hasSkillsInterests) return null;

            const lines = [];

            if (skills?.trim()) {
            lines.push(`Skills: ${skills.trim()}`);
            }
            if (languages?.trim()) {
            lines.push(`Languages: ${languages.trim()}`);
            }
            if (expertise?.trim()) {
            // Let the user decide what they put here (interests, functional strengths etc.)
            lines.push(`Interests / Strengths: ${expertise.trim()}`);
            }

            return (
            <View style={styles.stIndentedBlock}>
                {lines.map((line, idx) => (
                <Text key={idx} style={styles.stBodyText}>
                    {line}
                </Text>
                ))}
            </View>
            );
        };

        return (
            <View style={styles.stPageOuter}>
            <View style={styles.stPageInner}>
                {/* HEADER */}
                <View style={styles.stHeaderRow}>
                <View style={styles.stHeaderLeft}>
                    <Text style={styles.stName}>{mainName}</Text>
                    <Text style={styles.stHeadline}>{mainHeadline}</Text>
                </View>

                <View style={styles.stHeaderRight}>
                    {contactLines.map((line, idx) => (
                    <Text key={idx} style={styles.stContactText}>
                        {line}
                    </Text>
                    ))}
                </View>
                </View>

                {/* One-line professional summary, optional */}
                {summary?.trim() ? (
                <View style={styles.stSummaryRow}>
                    <Text style={styles.stSummaryText}>{summary.trim()}</Text>
                </View>
                ) : null}

                <View style={styles.stDivider} />

                {/* EDUCATION FIRST */}
                {hasEducation && (
                <Section title="EDUCATION">
                    {renderMultilineBlock(education)}
                </Section>
                )}

                {/* PROFESSIONAL EXPERIENCE */}
                {hasExperience && (
                <Section title="PROFESSIONAL EXPERIENCE">
                    {renderMultilineBlock(experience)}
                </Section>
                )}

                {/* LEADERSHIP & ACTIVITIES (clubs, projects, awards, referrals) */}
                {hasLeadership && (
                <Section title="LEADERSHIP & ACTIVITIES">
                    {renderLeadershipBlock()}
                </Section>
                )}

                {/* SKILLS & INTERESTS */}
                {hasSkillsInterests && (
                <Section title="SKILLS & INTERESTS">
                    {renderSkillsInterestsBlock()}
                </Section>
                )}
            </View>
            </View>
        );
    }

    // Other templates – still stubs for now
    case "classic":
      return (
        <View style={styles.pvPage}>
          {/* Classic Template (TODO) */}
        </View>
      );

    case "traditional":
      return (
        <View style={styles.pvPage}>
          {/* Traditional Template (TODO) */}
        </View>
      );

    case "professional":
      return (
        <View style={styles.pvPage}>
          {/* Professional Template (TODO) */}
        </View>
      );

    case "clear":
      return (
        <View style={styles.pvPage}>
          {/* Clear Template (TODO) */}
        </View>
      );

    case "creative":
      return (
        <View style={styles.pvPage}>
          {/* Creative Template (TODO) */}
        </View>
      );

    // Default fallback
    default:
      return (
        <View style={styles.pvPage}>
          <View style={styles.pvHeaderClassic}>
            <Text style={styles.pvName}>{mainName}</Text>
            <Text style={styles.pvHeadline}>{mainHeadline}</Text>
            {renderContact(contact)}
          </View>
          <Section title="SUMMARY" text={summary} />
          <Section title="EXPERIENCE" text={experience} />
          <Section title="EDUCATION" text={education} />
          <Section title="SKILLS" text={skills} />
          <Section title="PROJECTS" text={projects} />
        </View>
      );
  }
}