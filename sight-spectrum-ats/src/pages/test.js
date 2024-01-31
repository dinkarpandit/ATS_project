<div id={`FO_${employee._id}`} onClick={()=>{setRowId(employee._id);setUpdateCallout(true)}} className={styles.moreOptions}>
                                               <FontIcon iconName='MoreVertical' className={iconClass1}/>
                                                  {rowId === employee._id && (
                                                 updateCallout && <Callout gapSpace={0} target={`#FO_${employee._id}`} onDismiss={()=>setRowId('')}
                                              isBeakVisible={false} directionalHint={DirectionalHint.bottomRightEdge}>
                                                <div style={{display:'flex', flexDirection:'column'}}>
                                                  <DefaultButton text="Edit" onClick={()=>navigateTo(`/employee/editemployee?employee_id=${employee._id}`)}  styles={calloutBtnStyles}/>
                                                  <DefaultButton onClick={()=>updateEmployee(employee._id,'status',employee.status,employee_index)} text={employee.status === 'Active' ? 'Mark Inactive' : 'Mark Active' } styles={calloutBtnStyles}/>
                                                  <DefaultButton onClick={()=>deleteEmployee(employee)} text="Delete" styles={calloutBtnStyles}/>
                                                </div>
                                              </Callout>
                                              )}
                                          </div>